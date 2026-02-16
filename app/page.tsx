'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { AISearchBar } from '@/components/ui/AISearchBar'
import { TripCardGlass } from '@/components/trips/TripCardGlass'
import { IconCircle } from '@/components/ui/IconCircle'
import { CheckSquare, Wallet, Baby, Plane, FileText, Plus } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check auth and fetch trips
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setUserName(session.user.user_metadata?.full_name?.split(' ')[0] || 'Traveler')

        // Fetch user's trips
        const { data: tripsData } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', session.user.id)
          .order('start_date', { ascending: true })
          .limit(5)

        if (tripsData) setTrips(tripsData)
      }
    }
    init()
  }, [])

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()

      // Navigate to trip creation with parsed data
      const params = new URLSearchParams({
        destination: data.destination || '',
        country: data.country || '',
        duration: data.duration?.toString() || '5',
        numAdults: data.numAdults?.toString() || '2',
        numKids: data.numKids?.toString() || '0',
        tripType: data.tripType || 'adventure',
      })
      router.push(`/trips/new?${params.toString()}`)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getDestinationEmoji = (destination: string) => {
    const emojiMap: Record<string, string> = {
      dubai: '☀️',
      thailand: '🌴',
      singapore: '🏙️',
      bali: '🏝️',
      malaysia: '🦜',
      maldives: '🐚',
      japan: '🗾',
      default: '✈️',
    }
    return emojiMap[destination?.toLowerCase()] || emojiMap.default
  }

  const features = [
    {
      icon: <CheckSquare className="w-5 h-5" />,
      title: 'Smart Checklists',
      desc: 'AI-powered packing lists',
      color: 'lavender' as const,
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      title: 'Budget Tracking',
      desc: 'Track expenses easily',
      color: 'plum' as const,
    },
    {
      icon: <Baby className="w-5 h-5" />,
      title: 'Kid Activities',
      desc: 'Family-friendly suggestions',
      color: 'grape' as const,
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: 'Flight Organizer',
      desc: 'All bookings in one place',
      color: 'lavender' as const,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Documents',
      desc: 'Store travel documents',
      color: 'plum' as const,
    },
  ]

  return (
    <div className="min-h-screen pb-32 px-5 pt-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-xs">
              {userName?.charAt(0)?.toUpperCase() || 'J'}
            </span>
          </div>
          <span className="text-gray-500 text-sm">{getGreeting()}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {user ? `Welcome back,` : 'Welcome to'}
        </h1>
        <h1 className="text-2xl font-bold text-gray-900">
          {user ? `${userName}! 👋` : 'JourneyAI! 👋'}
        </h1>
        <p className="text-gray-500 mt-1">Plan your next family adventure</p>
      </div>

      {/* AI Search Bar */}
      <div className="mb-8">
        <AISearchBar onSubmit={handleSearch} isLoading={isLoading} />
      </div>

      {/* Features Section */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-800 mb-4">What JourneyAI does for you</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {features.map((feature, index) => (
            <GlassCard key={index} className="w-44 flex-shrink-0">
              <IconCircle icon={feature.icon} color={feature.color} size="md" />
              <h3 className="font-semibold text-gray-800 mt-3 text-sm">{feature.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Your Trips Section */}
      <div>
        <h2 className="font-bold text-gray-800 mb-4">Your Trips</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {trips.length > 0 ? (
            <>
              {trips.map((trip) => (
                <TripCardGlass
                  key={trip.id}
                  id={trip.id}
                  destination={trip.destination}
                  emoji={getDestinationEmoji(trip.destination)}
                  date={new Date(trip.start_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  travelers={(trip.adults || 2) + (trip.kids || 0)}
                  status={
                    new Date(trip.end_date) < new Date()
                      ? 'completed'
                      : new Date(trip.start_date) <= new Date()
                      ? 'in-progress'
                      : 'upcoming'
                  }
                  onClick={() => router.push(`/trips/${trip.id}`)}
                />
              ))}
            </>
          ) : null}

          {/* Create New Trip Card */}
          <div
            onClick={() => router.push('/trips/new')}
            className="w-36 flex-shrink-0 border-2 border-dashed border-purple-200 rounded-3xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-purple-500 text-sm font-medium text-center">Create Trip</span>
          </div>
        </div>
      </div>

      {/* Quick Chips - for non-logged in users */}
      {!user && (
        <div className="mt-8">
          <p className="text-gray-500 text-sm mb-3 text-center">Popular destinations</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Dubai 5 days', 'Bali beach trip', 'Singapore family', 'Thailand budget'].map(
              (chip) => (
                <button
                  key={chip}
                  onClick={() => handleSearch(chip)}
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/40 rounded-full text-sm text-gray-700 hover:bg-white transition-colors"
                >
                  {chip}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
