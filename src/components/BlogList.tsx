'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryBadge from '@/components/CategoryBadge';

interface PostData {
  slug: string;
  date: string;
  title: string;
  description: string;
  game: string;
}

interface BlogListProps {
  posts: PostData[];
}

const filters = [
  { name: 'Website Update', icon: null },
  { name: 'Deadlock', icon: '/Games/Deadlock/Icons/deadlock.png' },
  { name: 'Overwatch', icon: '/Games/Overwatch/Icons/OverwatchIcon.png' },
  { name: 'Apex Legends', icon: '/Games/Apex/Icons/apex.png' },
];

export default function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? posts.filter(post => post.game === selectedCategory)
    : posts;

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setSelectedCategory(selectedCategory === filter.name ? null : filter.name)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedCategory === filter.name
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            {filter.icon && (
              <div className="relative w-5 h-5 mr-2">
                <Image 
                  src={filter.icon} 
                  alt={filter.name} 
                  fill 
                  className="object-contain"
                  sizes="20px"
                />
              </div>
            )}
            {!filter.icon && filter.name === 'Website Update' && (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
               </svg>
            )}
            {filter.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(({ slug, date, title, description, game }) => (
            <article key={slug} className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800 transition-colors border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2 text-sm">
                <CategoryBadge category={game} />
                <span className="text-gray-500">{date}</span>
              </div>
              <Link href={`/blog/${slug}`}>
                <h2 className="text-2xl font-bold mb-2 hover:text-blue-400 transition-colors">{title}</h2>
              </Link>
              <p className="text-gray-400">{description}</p>
            </article>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-800/20 rounded-lg border border-gray-800 border-dashed">
            <p className="text-gray-500">No posts found for this category.</p>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
