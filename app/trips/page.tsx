'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, MoreVertical, Trash2 } from 'lucide-react'

export default function TripsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(null)
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  const fetchTrips = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true })

    if (data) setTrips(data)
    setLoading(false)
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
      india: '🇮🇳',
      'sri lanka': '🌺',
    }
    return emojiMap[destination?.toLowerCase()] || '✈️'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  }

  const handleDeleteTrip = async (tripId: string) => {
    const confirmed = window.confirm('Delete this trip? This cannot be undone.')
    if (!confirmed) return

    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId)

      if (error) throw error

      // Remove from local state
      setTrips(trips.filter((t) => t.id !== tripId))
    } catch (error) {
      console.error('Failed to delete trip:', error)
      alert('Failed to delete trip. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1">My Trips</h1>
          <p className="text-gray-500 text-sm md:text-base">All your adventures in one place</p>
        </div>

        {/* Grid of Trips */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {trips.map((trip) => (
              <div key={trip.id} className="relative">
                <div
                  onClick={() => router.push(`/trips/${trip.id}`)}
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl md:text-5xl mb-2">{getDestinationEmoji(trip.destination)}</div>
                  <h3 className="font-bold text-base md:text-lg line-clamp-1">{trip.destination}</h3>
                  <p className="text-gray-500 text-sm md:text-base line-clamp-1">{trip.country}</p>
                  <p className="text-gray-400 text-xs md:text-sm mt-2">
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </p>

                  {/* 3-dot menu button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(showMenu === trip.id ? null : trip.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-100 bg-white/80 shadow-sm z-10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Dropdown menu */}
                {showMenu === trip.id && (
                  <div
                    className="absolute top-10 right-2 bg-white shadow-lg rounded-xl py-1 z-20 border border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTrip(trip.id)
                        setShowMenu(null)
                      }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Trip
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add New Trip Card */}
            <div
              onClick={() => router.push('/')}
              className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-colors min-h-[140px] md:min-h-[160px]"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <p className="text-gray-500 text-sm md:text-base font-medium">New Trip</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl md:text-7xl lg:text-8xl mb-4">✈️</div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">No trips yet</h3>
            <p className="text-gray-500 text-sm md:text-base mb-6">Start planning your first adventure!</p>
            <button
              onClick={() => router.push('/')}
              className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-sm md:text-base font-medium flex items-center gap-2 mx-auto hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
