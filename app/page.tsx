import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, CheckCircle, Wallet, MapPin, Sparkles, Search, Bot } from 'lucide-react'

const quickChips = [
  'Luxury stay in Dubai',
  'Budget trip to Malaysia',
  'Beach vacation in Bali',
  'Family trip to Singapore'
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/trips')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-gray-900">AI Trip Planner</span>
            </div>
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Sign Up / Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* White Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/90 z-10" />

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            AI-POWERED TRAVEL CONCIERGE
          </div>

          {/* Main Headlines */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="text-gray-900">Your personal AI Concierge</span>
            <br />
            <span className="text-primary italic">for International trips</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Plan smarter, travel better. Let AI craft your perfect itinerary in seconds.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative bg-white rounded-2xl shadow-lg p-2">
              <div className="flex items-center gap-2">
                <Search className="ml-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  className="flex-1 px-4 py-4 text-lg focus:outline-none"
                />
                <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Popular Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-700">Popular:</span>
            {quickChips.map((chip) => (
              <button
                key={chip}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
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
          {/* Section Label */}
          <div className="text-center mb-4">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">
              FEATURES
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            What your AI Concierge does for you
          </h2>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1: Smart Planning */}
            <div className="bg-white rounded-xl p-8 border-2 border-dashed border-purple-200">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered itinerary planning with personalized recommendations for activities, restaurants, and attractions.
              </p>
            </div>

            {/* Card 2: Budget Management */}
            <div className="bg-white rounded-xl p-8 border-2 border-dashed border-purple-200">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Budget Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track expenses with receipt uploads, get currency conversions, and stay within your budget effortlessly.
              </p>
            </div>

            {/* Card 3: Complete Checklists */}
            <div className="bg-white rounded-xl p-8 border-2 border-dashed border-purple-200">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Checklists</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart packing lists, document management, and booking organization all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 Ramu.ai - Your AI Travel Concierge</p>
        </div>
      </footer>
    </div>
  )
}
