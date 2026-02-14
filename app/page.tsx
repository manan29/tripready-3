import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, CheckCircle, Wallet, MapPin, Sparkles, Search, Bot } from 'lucide-react'

const trendingDestinations = [
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    season: 'Nov-Mar',
    pricePerDay: '₹8,000',
    image: '🏙️',
    gradient: 'from-orange-400 to-pink-500'
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    season: 'Feb-Apr',
    pricePerDay: '₹6,500',
    image: '🌆',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    city: 'Bangkok',
    country: 'Thailand',
    season: 'Nov-Feb',
    pricePerDay: '₹3,500',
    image: '🛕',
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    city: 'Vietnam',
    country: 'Vietnam',
    season: 'Feb-Apr',
    pricePerDay: '₹3,000',
    image: '🏞️',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    city: 'Bali',
    country: 'Indonesia',
    season: 'Apr-Oct',
    pricePerDay: '₹4,000',
    image: '🏝️',
    gradient: 'from-teal-400 to-blue-500'
  },
  {
    city: 'Malaysia',
    country: 'Malaysia',
    season: 'Dec-Feb',
    pricePerDay: '₹3,800',
    image: '🌴',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    city: 'Maldives',
    country: 'Maldives',
    season: 'Nov-Apr',
    pricePerDay: '₹12,000',
    image: '🏖️',
    gradient: 'from-cyan-400 to-blue-600'
  },
  {
    city: 'Sri Lanka',
    country: 'Sri Lanka',
    season: 'Dec-Mar',
    pricePerDay: '₹4,500',
    image: '🌊',
    gradient: 'from-amber-400 to-orange-500'
  }
]

const quickChips = [
  'Luxury stay in Dubai',
  'Budget trip to Malaysia',
  'Beach vacation in Bali'
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/trips')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">AI Trip Planner</span>
          </div>
          <Link
            href="/trips"
            className="rounded-full bg-white border-2 border-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
          >
            My Trips
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Travel Concierge
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Your personal AI Concierge<br />
          <span className="text-primary-500">for International trips</span>
        </h1>

        {/* AI Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Where do you want to go?"
              className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-lg shadow-lg"
            />
          </div>
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {quickChips.map((chip) => (
            <button
              key={chip}
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          What your AI Concierge does for you
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Planning</h3>
            <p className="text-gray-600">
              AI-powered itinerary planning with personalized recommendations for activities, restaurants, and attractions.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget Management</h3>
            <p className="text-gray-600">
              Track expenses with receipt uploads, get currency conversions, and stay within your budget effortlessly.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Checklists</h3>
            <p className="text-gray-600">
              Smart packing lists, document management, and booking organization all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Trending Destinations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingDestinations.map((dest) => (
            <div
              key={dest.city}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className={`h-32 bg-gradient-to-br ${dest.gradient} flex items-center justify-center text-5xl`}>
                {dest.image}
              </div>
              <div className="p-4">
                <div className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 mb-2">
                  {dest.country}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{dest.city}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Best: {dest.season}</span>
                </div>
                <div className="mt-2 text-lg font-bold text-primary-600">
                  {dest.pricePerDay}/day
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to plan your next adventure?</h2>
          <p className="text-primary-100 mb-8">Let AI handle the details while you dream about your trip.</p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-medium text-primary-600 hover:bg-primary-50 transition-colors shadow-lg"
          >
            Start Planning — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Ramu.ai - Your AI Travel Concierge</p>
      </footer>
    </div>
  )
}
