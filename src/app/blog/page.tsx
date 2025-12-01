import Link from 'next/link';
import { getSortedPostsData } from '@/lib/blog';
import BlogList from '@/components/BlogList';

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white" style={{ backgroundColor: 'var(--bg-page)' }}>
      <header className="bg-gray-800 shadow-md" style={{ backgroundColor: 'var(--bg-header)' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-400 leading-none">
            VLViewer.com
          </Link>
          <Link href="/blog" className="text-gray-300 hover:text-white font-medium">
            Blog
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 border-b border-gray-800 pb-4">Latest Updates</h1>
          <BlogList posts={allPostsData} />
        </div>
      </main>

      <footer className="bg-gray-800 py-6 mt-12" style={{ backgroundColor: 'var(--bg-footer)' }}>
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} VLViewer.com. This is a fan website.</p>
        </div>
      </footer>
    </div>
  );
}
