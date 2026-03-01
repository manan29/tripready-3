import type { Metadata, Viewport } from 'next';
import { plusJakarta, jetbrainsMono } from '@/lib/design-system/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'JourneyAI - Smart Family Travel Planning',
  description: 'AI-powered travel planning for Indian families. Get personalized packing lists, flight recommendations, and trip insights.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JourneyAI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A7A6E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
