import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/navigation/BottomNav'
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'JourneyAI - Your AI Travel Concierge',
    template: '%s | JourneyAI',
  },
  description:
    'Your personal AI Concierge for international trips. Smart planning, budget management, packing lists, and complete travel organization.',
  keywords: [
    'travel planning',
    'AI travel',
    'trip planner',
    'itinerary',
    'travel budget',
    'packing list',
  ],
  authors: [{ name: 'JourneyAI' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JourneyAI',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://journeyai.com',
    title: 'JourneyAI - Your AI Travel Concierge',
    description: 'Plan perfect trips with AI. Smart itineraries, budgets, and organization.',
    siteName: 'JourneyAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JourneyAI - Your AI Travel Concierge',
    description: 'Plan perfect trips with AI. Smart itineraries, budgets, and organization.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#7C3AED',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="JourneyAI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JourneyAI" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} app-bg`}>
        <main className="min-h-screen pb-20 md:pb-24">
          {children}
        </main>
        <PWAInstallPrompt />
        <BottomNav />
      </body>
    </html>
  )
}
