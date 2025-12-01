import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VLViewer.com - Choose Your Universe',
  description: 'Explore voice lines, interactions, and conversations from your favorite games. Select a game to start browsing.',
  openGraph: {
    title: 'VLViewer.com - Choose Your Universe',
    description: 'Explore voice lines, interactions, and conversations from your favorite games. Select a game to start browsing.',
    url: 'https://vlviewer.com', // Placeholder URL for the base domain
    siteName: 'VLViewer.com',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'VLViewer.com - Choose Your Universe',
    description: 'Explore voice lines, interactions, and conversations from your favorite games. Select a game to start browsing.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
