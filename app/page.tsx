'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, CheckCircle, Wallet, Sparkles, Search, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'

const quickChips = [
  'Dubai 5 days',
  'Bali beach trip',
  'Singapore family',
  'Thailand budget'
]

const features = [
  {
    icon: Sparkles,
    title: 'AI Trip Planning',
    description: 'Tell us where you want to go, and AI creates a complete itinerary with activities, restaurants, and attractions.'
  },
  {
    icon: CheckCircle,
    title: 'Smart Packing Lists',
    description: 'Get AI-generated packing lists based on your destination, weather, trip duration, and whether you\'re traveling with kids.'
  },
  {
    icon: Wallet,
    title: 'Budget Tracking',
    description: 'Set your budget, track expenses in any currency, upload receipts, and always know where you stand.'
  },
  {
    icon: FileText,
    title: 'Document Storage',
    description: 'Store passports, visas, insurance in one secure place. Quick access at immigration.'
  },
  {
    icon: Plane,
    title: 'Flight & Hotel Organizer',
    description: 'Enter your flight number and get all details auto-filled. Keep bookings organized.'
  }
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChipClick = (chipText: string) => {
    setSearchQuery(chipText)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      // Call AI parsing API
      const response = await fetch('/api/ai/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error('Failed to parse trip')
      }

      const parsed = await response.json()

      // Build query string with parsed data
      const params = new URLSearchParams({
        destination: parsed.destination || '',
        country: parsed.country || '',
        duration: parsed.duration?.toString() || '5',
        numAdults: parsed.numAdults?.toString() || '2',
        numKids: parsed.numKids?.toString() || '0',
        tripType: parsed.tripType || 'adventure',
        ...(parsed.startDate && { startDate: parsed.startDate }),
        ...(parsed.endDate && { endDate: parsed.endDate }),
      })

      // Redirect with parsed data
      router.push(`/trips/new?${params.toString()}`)
    } catch (error) {
      console.error('Error parsing trip:', error)
      // Fallback: redirect with just the query
      router.push(`/trips/new?query=${encodeURIComponent(searchQuery)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar with Dynamic Auth */}
      <Navbar />

      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-20">
        {/* Animated Circles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-ripple-1 absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl" />
          <div className="animate-ripple-2 absolute top-1/3 right-1/3 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="animate-ripple-3 absolute bottom-1/4 left-1/2 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl" />
          <div className="animate-ripple-4 absolute top-1/2 right-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold mb-8 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            AI-POWERED TRAVEL CONCIERGE
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="text-gray-900">Plan your perfect trip</span>
            <br />
            <span className="text-primary italic">with AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Let AI craft personalized itineraries, manage budgets, and organize everything for your international adventure.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative bg-white rounded-2xl shadow-xl p-2">
              <div className="flex items-center gap-2">
                <Search className="ml-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Where do you want to go? Try 'Dubai for 5 days'"
                  className="flex-1 px-4 py-4 text-lg focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Planning...' : 'Plan Trip'}
                </button>
              </div>
            </div>
          </form>

          {/* Popular Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-gray-500 text-sm">Popular:</span>
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            What JourneyAI does for you
          </h2>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            See JourneyAI in action
          </h2>

          {/* Phone Mockup Placeholders */}
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {/* Placeholder 1 */}
            <div className="w-64 h-[500px] bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl shadow-xl flex items-center justify-center border-8 border-gray-800">
              <div className="text-center p-8">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-gray-600 font-medium">AI Itinerary<br />Screenshot</p>
              </div>
            </div>

            {/* Placeholder 2 */}
            <div className="w-64 h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-xl flex items-center justify-center border-8 border-gray-800">
              <div className="text-center p-8">
                <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Budget Tracker<br />Screenshot</p>
              </div>
            </div>

            {/* Placeholder 3 */}
            <div className="w-64 h-[500px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-xl flex items-center justify-center border-8 border-gray-800">
              <div className="text-center p-8">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Packing List<br />Screenshot</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">
                  Journey<span className="text-primary">AI</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your AI-powered travel companion for planning perfect international trips.
              </p>
            </div>

            {/* Column 2: Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">Pricing (Coming Soon)</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 JourneyAI - Your AI Travel Concierge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes ripple-1 {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2) translate(20px, -20px);
            opacity: 0.5;
          }
        }

        @keyframes ripple-2 {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.3) translate(-30px, 30px);
            opacity: 0.4;
          }
        }

        @keyframes ripple-3 {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15) translate(-20px, -30px);
            opacity: 0.6;
          }
        }

        @keyframes ripple-4 {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.25) translate(25px, 25px);
            opacity: 0.45;
          }
        }

        .animate-ripple-1 {
          animation: ripple-1 15s ease-in-out infinite;
        }

        .animate-ripple-2 {
          animation: ripple-2 18s ease-in-out infinite;
        }

        .animate-ripple-3 {
          animation: ripple-3 20s ease-in-out infinite;
        }

        .animate-ripple-4 {
          animation: ripple-4 22s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
