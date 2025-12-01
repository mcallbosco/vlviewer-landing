import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Voiceline Viewer - Deadlock, Overwatch, and Apex',
  description: 'Explore voice lines and interactions from your favorite games.',
  openGraph: {
    title: 'Voiceline Viewer - Deadlock, Overwatch, and Apex',
    description: 'Explore voice lines and interactions from your favorite games.',
    url: 'https://vlviewer.com', // Placeholder URL for the base domain
    siteName: 'VLViewer.com',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Voiceline Viewer - Deadlock, Overwatch, and Apex',
    description: 'Explore voice lines and interactions from your favorite games.'
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
