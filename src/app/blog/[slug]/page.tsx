import Link from 'next/link';
import { getAllPostSlugs, getPostData } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import CategoryBadge from '@/components/CategoryBadge';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const postData = await getPostData(slug);

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
        <article className="max-w-3xl mx-auto">
          <div className="mb-8 pb-8 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4 text-sm">
              <Link href="/blog" className="text-gray-500 hover:text-gray-300">← Back to Blog</Link>
              <span className="text-gray-600">•</span>
              <CategoryBadge category={postData.game} />
              <span className="text-gray-500">{postData.date}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{postData.title}</h1>
            <p className="text-xl text-gray-400">{postData.description}</p>
          </div>
          
          <div className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown>{postData.content}</ReactMarkdown>
          </div>
        </article>
      </main>

      <footer className="bg-gray-800 py-6 mt-12" style={{ backgroundColor: 'var(--bg-footer)' }}>
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} VLViewer.com. This is a fan website.</p>
        </div>
      </footer>
    </div>
  );
}
