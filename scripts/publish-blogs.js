#!/usr/bin/env node

/**
 * Publishes blog metadata to Cloudflare R2 (S3-compatible storage)
 * 
 * Required environment variables:
 * - R2_ACCESS_KEY_ID: Cloudflare R2 access key
 * - R2_SECRET_ACCESS_KEY: Cloudflare R2 secret key
 * - R2_BUCKET_NAME: The R2 bucket name
 * - R2_ACCOUNT_ID: Your Cloudflare account ID
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const BLOG_DIR = path.join(process.cwd(), 'content/blog');
const BASE_URL = 'https://vlviewer.com/blog';

/**
 * Read and parse all blog posts from the content directory
 */
function getAllPosts() {
    if (!fs.existsSync(BLOG_DIR)) {
        console.log('No blog directory found at:', BLOG_DIR);
        return [];
    }

    const fileNames = fs.readdirSync(BLOG_DIR);
    const posts = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(BLOG_DIR, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data: frontmatter } = matter(fileContents);

            // Include all frontmatter fields (title, date, game, description, and any custom tags)
            return {
                slug,
                url: `${BASE_URL}/${slug}`,
                ...frontmatter
            };
        });

    // Sort by date descending (newest first)
    return posts.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
    });
}

/**
 * Upload the blog feed to R2
 */
async function uploadToR2(blogData) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error('Missing required R2 environment variables. Need: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
    }

    const client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    const jsonContent = JSON.stringify(blogData, null, 2);

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: 'blogs.json',
        Body: jsonContent,
        ContentType: 'application/json',
    });

    await client.send(command);
    console.log(`✅ Successfully uploaded blogs.json to R2 bucket: ${bucketName}`);
}

async function main() {
    console.log('📝 Reading blog posts...');
    const posts = getAllPosts();
    console.log(`Found ${posts.length} blog post(s)`);

    const blogData = {
        lastUpdated: new Date().toISOString(),
        baseUrl: BASE_URL,
        posts,
    };

    // If running locally without R2 credentials, just output the JSON
    if (!process.env.R2_ACCESS_KEY_ID) {
        console.log('\n📄 Blog data (R2 credentials not configured, outputting locally):');
        console.log(JSON.stringify(blogData, null, 2));

        // Write to local file for testing
        const outputPath = path.join(process.cwd(), 'blogs.json');
        fs.writeFileSync(outputPath, JSON.stringify(blogData, null, 2));
        console.log(`\n💾 Written to: ${outputPath}`);
        return;
    }

    console.log('☁️  Uploading to Cloudflare R2...');
    await uploadToR2(blogData);
}

main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
