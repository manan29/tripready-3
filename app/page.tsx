'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { AISearchBar } from '@/components/ui/AISearchBar'
import { TripCardGlass } from '@/components/trips/TripCardGlass'
import { IconCircle } from '@/components/ui/IconCircle'
import { CreateTripModal } from '@/components/trips/CreateTripModal'
import { CheckSquare, Wallet, Baby, Plane, FileText, Plus, TrendingUp } from 'lucide-react'
import { TOP_DESTINATIONS } from '@/lib/destinations'
import { ScrollingChips } from '@/components/ui/ScrollingChips'

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalDestination, setModalDestination] = useState('')
  const [modalCountry, setModalCountry] = useState('')
  const [modalNumKids, setModalNumKids] = useState(0)
  const [modalKidAges, setModalKidAges] = useState<number[]>([])
  const [modalStartDate, setModalStartDate] = useState('')
  const [modalEndDate, setModalEndDate] = useState('')
  const [modalNumAdults, setModalNumAdults] = useState(2)

  // Handle search function
  const handleSearch = async (query: string) => {
    setIsLoading(true)
    try {
      console.log('Searching for:', query)
      const response = await fetch('/api/ai/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to parse trip'
        console.error('API Error:', errorMsg)
        alert(`Error: ${errorMsg}`)
        setIsLoading(false)
        return
      }

      // Check if parsing was successful
      if (!data.parsed_successfully && data.parsed_successfully !== undefined) {
        const errorMsg = data.error || 'Could not understand your query'
        console.log('Parsing failed:', errorMsg)
        alert(`${errorMsg}\n\nTry: "Dubai with 2 kids" or "Singapore family trip"`)
        setIsLoading(false)
        return
      }

      console.log('Opening modal with data:', data)

      // Show modal with parsed data
      setModalDestination(data.destination || query)
      setModalCountry(data.country || '')
      setModalNumKids(data.num_kids || 0)
      setModalKidAges(data.kid_ages || [])
      setModalStartDate(data.start_date || '')
      setModalEndDate(data.end_date || '')
      setModalNumAdults(data.num_adults || 2)
      setShowCreateModal(true)
    } catch (error: any) {
      console.error('Search error:', error)
      alert(`Failed to process your search: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

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

      // Check if destination was passed from explore page
      const destinationParam = searchParams.get('destination')
      if (destinationParam) {
        handleSearch(destinationParam)
        // Clean URL
        router.replace('/', { scroll: false })
      }
    }
    init()
  }, [])

  const handleTripCreated = async (tripData: any) => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return URL
      router.push('/login?returnTo=/trips/new')
      return
    }

    // Create trip in database
    try {
      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: tripData.destination,
          country: tripData.country,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          num_adults: tripData.numAdults,
          num_kids: tripData.numKids,
          kid_ages: tripData.kidAges,
        })
        .select()
        .single()

      if (error) throw error

      // Save packing items if we have them
      if (trip && tripData.packingList) {
        const packingItems: any[] = []
        let sortOrder = 0

        // Add kids items (if present)
        if (tripData.packingList.kids_items) {
          tripData.packingList.kids_items.forEach((cat: any) => {
            cat.items.forEach((item: string) => {
              packingItems.push({
                trip_id: trip.id,
                user_id: user.id,
                title: item,
                category: cat.category,
                is_packed: false,
                sort_order: sortOrder++,
              })
            })
          })
        }

        // Add general items (if present)
        if (tripData.packingList.general_items) {
          tripData.packingList.general_items.forEach((cat: any) => {
            cat.items.forEach((item: string) => {
              packingItems.push({
                trip_id: trip.id,
                user_id: user.id,
                title: item,
                category: cat.category,
                is_packed: false,
                sort_order: sortOrder++,
              })
            })
          })
        }

        // Insert all packing items
        if (packingItems.length > 0) {
          await supabase.from('packing_items').insert(packingItems)
        }
      }

      // Navigate to trip detail
      router.push(`/trips/${trip.id}`)
    } catch (error) {
      console.error('Error creating trip:', error)
      alert('Failed to create trip. Please try again.')
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
    <div className="min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          {user ? (
            <>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold text-purple-600">
                    {userName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm md:text-base">Welcome back!</p>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{userName} 👋</h1>
                </div>
              </div>
              <p className="text-[#1E293B] text-sm md:text-base mt-4">
                AI-powered packing lists for your kids. Know exactly what to pack.
              </p>
            </>
          ) : (
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Travel Stress-Free with Kids</h1>
              <p className="text-purple-600 text-base md:text-lg font-medium italic">Let JourneyAI Plan It</p>
              <p className="text-[#1E293B] text-sm md:text-base mt-4">
                AI-powered packing lists for your kids. Know exactly what to pack for your 3-year-old
                in Dubai.
              </p>
            </div>
          )}
        </div>

        {/* AI Search Bar */}
        <div className="mb-4">
          <AISearchBar
            onSubmit={handleSearch}
            isLoading={isLoading}
            placeholder="Where are you taking the kids?"
          />
        </div>

        {/* Auto-Scrolling Chips - Kids Focused */}
        <div className="mb-8">
          <ScrollingChips
            chips={[
              'Dubai with toddler',
              'Singapore with kids',
              'Bali family trip',
              'Thailand with 2 kids',
              'Malaysia with baby',
              'Maldives family vacation',
              'Sri Lanka with toddler',
              'Japan with kids',
            ]}
            onChipClick={handleSearch}
        />
      </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="font-bold text-[#1E293B] text-base md:text-lg mb-4">What JourneyAI does for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
            {features.map((feature, index) => (
              <GlassCard key={index} className="w-44 flex-shrink-0">
                <IconCircle icon={feature.icon} color={feature.color} size="md" />
                <h3 className="font-semibold text-[#1E293B] mt-3 text-sm">{feature.title}</h3>
                <p className="text-[#64748B] text-xs mt-1">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Popular Destinations Section */}
        <div className="mb-8">
          <h2 className="font-bold text-[#1E293B] text-base md:text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {TOP_DESTINATIONS.slice(0, 8).map((dest) => (
              <GlassCard
                key={dest.id}
                onClick={() => {
                  setModalDestination(dest.name)
                  setModalCountry(dest.country)
                  setShowCreateModal(true)
                }}
                className="text-center cursor-pointer hover:shadow-lg transition-shadow"
              >
                <span className="text-4xl md:text-5xl mb-2 block">{dest.emoji}</span>
                <h3 className="font-semibold text-[#1E293B] text-sm md:text-base">{dest.name}</h3>
                <p className="text-xs md:text-sm text-[#64748B]">{dest.country}</p>
                <p className="text-xs md:text-sm text-purple-500 mt-1 line-clamp-1">{dest.kidsHighlights[0]}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Your Trips Section - Only for logged in users */}
        {user && (
          <div>
            <h2 className="font-bold text-[#1E293B] text-base md:text-lg mb-4">Your Trips</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
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
              onClick={() => setShowCreateModal(true)}
              className="w-36 flex-shrink-0 border-2 border-dashed border-purple-200 rounded-3xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-purple-500 text-sm font-medium text-center">Create Trip</span>
              </div>
            </div>
          </div>
        )}

        {/* Create Trip Modal */}
        <CreateTripModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          initialDestination={modalDestination}
          initialCountry={modalCountry}
          initialNumKids={modalNumKids}
          initialKidAges={modalKidAges}
          initialStartDate={modalStartDate}
          initialEndDate={modalEndDate}
          initialNumAdults={modalNumAdults}
          onTripCreated={handleTripCreated}
        />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomePageContent />
    </Suspense>
  )
}
