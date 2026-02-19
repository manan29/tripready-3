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
    <div className="min-h-screen pb-32 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Centered Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4">
            What JourneyAI Can Do For You
          </h1>
          <p className="text-[#64748B] text-lg md:text-xl max-w-xl mx-auto">
            Your AI travel companion for stress-free family trips
          </p>
        </div>

        {/* AI Search Bar */}
        <div className="mb-12">
          <AISearchBar
            onSubmit={handleSearch}
            isLoading={isLoading}
            placeholder="Where are you taking the kids?"
          />
        </div>

        {/* 3 Simple Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="text-center p-8">
            <IconCircle icon={<CheckSquare className="w-5 h-5" />} color="lavender" size="lg" />
            <h3 className="font-semibold text-[#1E293B] mt-4 text-lg">Smart Checklists</h3>
            <p className="text-[#64748B] text-sm mt-2">
              AI-powered packing lists tailored for your family
            </p>
          </GlassCard>

          <GlassCard className="text-center p-8">
            <IconCircle icon={<Wallet className="w-5 h-5" />} color="plum" size="lg" />
            <h3 className="font-semibold text-[#1E293B] mt-4 text-lg">Budget Tracking</h3>
            <p className="text-[#64748B] text-sm mt-2">
              Track expenses and stay within your budget
            </p>
          </GlassCard>

          <GlassCard className="text-center p-8">
            <IconCircle icon={<Baby className="w-5 h-5" />} color="grape" size="lg" />
            <h3 className="font-semibold text-[#1E293B] mt-4 text-lg">Kid Activities</h3>
            <p className="text-[#64748B] text-sm mt-2">
              Family-friendly suggestions for every age
            </p>
          </GlassCard>
        </div>

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
