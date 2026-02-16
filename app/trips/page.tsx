'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { Plus, Calendar, Users, MapPin, ChevronRight } from 'lucide-react'

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
    }
    return emojiMap[destination?.toLowerCase()] || '✈️'
  }

  const getTripStatus = (trip: any) => {
    const today = new Date()
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)

    if (today < start) return 'upcoming'
    if (today >= start && today <= end) return 'ongoing'
    return 'past'
  }

  const ongoing = trips.filter((t) => getTripStatus(t) === 'ongoing')
  const upcoming = trips.filter((t) => getTripStatus(t) === 'upcoming')
  const past = trips.filter((t) => getTripStatus(t) === 'past')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 px-5 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Trips</h1>
        <p className="text-gray-500">All your adventures in one place</p>
      </div>

      {/* Ongoing Trips */}
      {ongoing.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Ongoing
          </h2>
          <div className="space-y-3">
            {ongoing.map((trip) => (
              <GlassCard
                key={trip.id}
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getDestinationEmoji(trip.destination)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trip.destination}</h3>
                      <p className="text-xs text-gray-500">{trip.country}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">Currently traveling</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Trips */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((trip) => {
              const daysToGo = Math.ceil(
                (new Date(trip.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )

              return (
                <GlassCard
                  key={trip.id}
                  onClick={() => router.push(`/trips/${trip.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getDestinationEmoji(trip.destination)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{trip.destination}</h3>
                        <p className="text-xs text-gray-500 mb-1">{trip.country}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(trip.start_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          {trip.travelers && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {trip.travelers}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          {daysToGo === 0
                            ? 'Tomorrow!'
                            : daysToGo === 1
                              ? '1 day to go'
                              : `${daysToGo} days to go`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </div>
      )}

      {/* Past Trips */}
      {past.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Past Trips</h2>
          <div className="space-y-3">
            {past.map((trip) => (
              <GlassCard
                key={trip.id}
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="cursor-pointer opacity-80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl grayscale">{getDestinationEmoji(trip.destination)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-700">{trip.destination}</h3>
                      <p className="text-xs text-gray-500">{trip.country}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(trip.start_date).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {trips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-6">Start planning your first adventure!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Your First Trip
          </button>
        </div>
      )}
    </div>
  )
}
