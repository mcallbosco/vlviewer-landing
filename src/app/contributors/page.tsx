import React from 'react';
import contributorsData from '@/data/contributors.json';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contributors - VLViewer',
  description: 'Community contributors to the Deadlock Transcriptions project.',
};

interface Contributor {
  name: string;
  lines: number;
  transcription_count: number;
  login?: string;
  avatar_url?: string;
  html_url?: string;
}

// Cast data to ensure type safety
const contributors: Contributor[] = contributorsData as Contributor[];

export default function ContributorsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white" style={{ backgroundColor: 'var(--bg-page)' }}>
      <header className="bg-gray-800 shadow-md" style={{ backgroundColor: 'var(--bg-header)' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-400 leading-none">
            Voiceline Viewer
          </Link>
          <div className="flex space-x-6">
            <Link href="/contributors" className="text-white font-medium transition-colors">
              Contributors
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white font-medium transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-400">
            Contributors
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A huge thank you to everyone who has contributed to the Deadlock Transcriptions project.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 pb-4 border-b border-gray-800 flex items-center">
            Deadlock Transcript Contributors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contributors.map((contributor, index) => {
              const displayName = contributor.login || contributor.name;
              const profileUrl = contributor.html_url;

              const CardContent = () => (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-700 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-transparent group-hover:border-blue-400">
                    {contributor.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={contributor.avatar_url}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {displayName}
                    </h3>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-blue-400">
                        {contributor.transcription_count.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Transcriptions
                      </span>
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={`${contributor.name}-${index}`}
                  className="bg-gray-800/80 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300 group overflow-hidden"
                >
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-5 w-full h-full"
                    >
                      <CardContent />
                    </a>
                  ) : (
                    <div className="p-5 w-full h-full">
                      <CardContent />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 py-6 mt-12" style={{ backgroundColor: 'var(--bg-footer)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 space-y-3">
            <p className="text-sm">
              Created by <a href="https://mcallbos.co" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Mcall</a>
            </p>
            <p className="pt-2">
              <a href="https://ko-fi.com/mcallbosco" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
                </svg>
                Buy me a coffee
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}