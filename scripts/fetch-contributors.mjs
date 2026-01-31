import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO_URL = 'https://github.com/mcallbosco/Deadlock-Transcriptions.git';
const REPO_OWNER = 'mcallbosco';
const REPO_NAME = 'Deadlock-Transcriptions';
const TEMP_DIR = path.join(process.cwd(), 'temp_deadlock_transcriptions');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'contributors.json');
const OFFSETS_FILE = path.join(process.cwd(), 'src', 'data', 'contributor_offsets.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function cleanUp() {
  if (fs.existsSync(TEMP_DIR)) {
    console.log('Cleaning up temp directory...');
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

function getOffsets() {
  if (fs.existsSync(OFFSETS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(OFFSETS_FILE, 'utf8'));
    } catch (error) {
      console.warn('Failed to read offsets file:', error.message);
    }
  }
  return {};
}

async function fetchGitHubUser(commitHash) {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commitHash}`, {
      headers: {
        'User-Agent': 'VLViewer-Contributor-Fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
            console.warn('GitHub API rate limit exceeded. Avatars may be missing.');
        }
        return null;
    }
    
    const data = await response.json();
    if (data.author) {
      return {
        login: data.author.login,
        avatar_url: data.author.avatar_url,
        html_url: data.author.html_url
      };
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch metadata for commit ${commitHash}:`, error.message);
    return null;
  }
}

async function fetchGitHubUserByLogin(login) {
  try {
    const response = await fetch(`https://api.github.com/users/${login}`, {
      headers: {
        'User-Agent': 'VLViewer-Contributor-Fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
        return null;
    }
    
    const data = await response.json();
    return {
      login: data.login,
      avatar_url: data.avatar_url,
      html_url: data.html_url
    };
  } catch (error) {
    console.warn(`Failed to fetch metadata for login ${login}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    cleanUp();

    console.log(`Cloning ${REPO_URL}...`);
    execSync(`git clone ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });

    console.log('Analyzing git log...');
    // Get log with patches for JSON files
    // Format: "HASH|||AUTHOR_NAME|||AUTHOR_EMAIL" followed by the patch
    const logCmd = 'git log --no-merges --pretty=format:"|||COMMIT|||%H|||%an|||%ae" -p -- "*.json"';
    
    // Increase buffer size to handle large logs
    const logOutput = execSync(logCmd, { cwd: TEMP_DIR, maxBuffer: 1024 * 1024 * 100 }).toString();

    const contributorsMap = {}; // Keyed by Name initially
    let currentAuthor = null;
    let currentHash = null;
    
    const lines = logOutput.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('|||COMMIT|||')) {
        const parts = line.split('|||');
        if (parts.length >= 4) {
            const hash = parts[2].trim();
            const name = parts[3].trim();
            // const email = parts[4].trim(); // Available if needed
            
            currentAuthor = name;
            currentHash = hash;
            
            if (!contributorsMap[currentAuthor]) {
              contributorsMap[currentAuthor] = {
                name: currentAuthor,
                lines: 0,
                transcription_count: 0,
                last_commit: currentHash
              };
            }
        }
      } else if (currentAuthor) {
        // Check for added lines in the patch
        if (line.startsWith('+') && !line.startsWith('+++')) {
          // It's an added line. Check for "text": pattern
          if (line.includes('"text":')) {
             contributorsMap[currentAuthor].transcription_count++;
          }
          contributorsMap[currentAuthor].lines++;
        }
      }
    }

    // Filter initially to those with content
    let rawContributors = Object.values(contributorsMap).filter(c => c.transcription_count > 0);
    console.log(`Found ${rawContributors.length} unique author names. Fetching GitHub metadata...`);

    const finalContributorsMap = {}; // Keyed by GitHub Login (if available) or Name

    // Process sequentially to respect rate limits gently, though parallel is faster.
    // Given the small number (20), sequential is fine and safer for logs.
    for (const contributor of rawContributors) {
        // console.log(`Fetching data for ${contributor.name}...`);
        const ghData = await fetchGitHubUser(contributor.last_commit);
        
        let key = contributor.name;
        if (ghData && ghData.login) {
            key = ghData.login;
        }

        if (!finalContributorsMap[key]) {
            finalContributorsMap[key] = {
                name: contributor.name, // Default to git name
                lines: 0,
                transcription_count: 0,
                ...ghData // Add login, avatar_url, html_url
            };
        }

        // Merge stats
        finalContributorsMap[key].lines += contributor.lines;
        finalContributorsMap[key].transcription_count += contributor.transcription_count;
        
        // If the new entry has a login and the existing one didn't (rare in this loop logic), update.
        if (ghData && !finalContributorsMap[key].login) {
             Object.assign(finalContributorsMap[key], ghData);
        }
    }

    // Apply manual offsets and additions
    const offsets = getOffsets();
    console.log(`Applying offsets and manual entries for ${Object.keys(offsets).length} users...`);
    for (const [key, offset] of Object.entries(offsets)) {
        if (!finalContributorsMap[key]) {
            console.log(`Creating manual entry for "${key}"...`);
            finalContributorsMap[key] = {
                name: key,
                lines: 0,
                transcription_count: 0
            };
            
            // If they provided a login but no metadata, try to fetch it
            const login = offset.login || key;
            if (!offset.avatar_url || !offset.html_url) {
                const ghData = await fetchGitHubUserByLogin(login);
                if (ghData) {
                    Object.assign(finalContributorsMap[key], ghData);
                }
            }
        }

        // Apply numeric offsets (additive)
        if (offset.transcription_count !== undefined) {
            finalContributorsMap[key].transcription_count += offset.transcription_count;
        }
        if (offset.lines !== undefined) {
            finalContributorsMap[key].lines += offset.lines;
        }

        // Apply field overrides (non-numeric fields or explicit overrides)
        for (const [field, value] of Object.entries(offset)) {
            if (field !== 'transcription_count' && field !== 'lines') {
                finalContributorsMap[key][field] = value;
            }
        }
    }

    const sortedContributors = Object.values(finalContributorsMap)
      .filter(c => c.login !== 'mcallbosco' && c.name !== 'copilot-swe-agent[bot]' && c.login !== 'jay-batalla')
      .sort((a, b) => b.transcription_count - a.transcription_count);

    console.log(`Resolved ${sortedContributors.length} unique contributors.`);
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedContributors, null, 2));
    console.log(`Wrote data to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Error fetching contributors:', error);
    process.exit(1);
  } finally {
    cleanUp();
  }
}

main();
