import Link from 'next/link';
import { getAllPostSlugs, getPostData } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
            Voiceline Viewer
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {postData.content}
            </ReactMarkdown>
          </div>
        </article>
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
