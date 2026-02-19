'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

export default function TripsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Trips</h1>
        <p className="text-gray-500">All your adventures in one place</p>
      </div>

      {/* Grid of Trips */}
      {trips.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => router.push(`/trips/${trip.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-2">{getDestinationEmoji(trip.destination)}</div>
              <h3 className="font-bold text-lg line-clamp-1">{trip.destination}</h3>
              <p className="text-gray-500 text-sm line-clamp-1">{trip.country}</p>
              <p className="text-gray-400 text-xs mt-2">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>
            </div>
          ))}

          {/* Add New Trip Card */}
          <div
            onClick={() => router.push('/')}
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-colors min-h-[140px]"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-gray-500 font-medium">New Trip</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-6">Start planning your first adventure!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Trip
          </button>
        </div>
      )}
    </div>
  )
}
