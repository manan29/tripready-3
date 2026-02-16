import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/navigation/BottomNav'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} app-bg safe-top`}>
        <main className="min-h-screen pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
