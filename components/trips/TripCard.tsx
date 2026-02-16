import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'
import { formatDate, daysUntil, getTripVisuals } from '@/lib/utils'

interface Trip {
  id: string
  destination: string
  start_date: string
  end_date: string
  adults: number
  kids: number
  status: string
  progress?: number
}

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const { gradient, icon } = getTripVisuals(trip.destination)
  const days = daysUntil(trip.start_date)
  const isPast = days < 0
  const isActive = trip.status === 'active'
  const progress = trip.progress || 0

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block border border-gray-100"
    >
      {/* Gradient Header with Icon */}
      <div className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <span className="text-5xl">{icon}</span>
        {isActive && (
          <span className="absolute top-3 right-3 text-xs bg-white text-green-600 px-3 py-1 rounded-full font-semibold shadow-sm">
            Active
          </span>
        )}
        {isPast && !isActive && (
          <span className="absolute top-3 right-3 text-xs bg-white text-gray-600 px-3 py-1 rounded-full font-semibold shadow-sm">
            Completed
          </span>
        )}
      </div>

      {/* Trip Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          {trip.destination}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>{formatDate(trip.start_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-blue-600" />
            <span>{trip.adults + trip.kids}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-600 font-medium">Preparation</span>
            <span className="font-bold text-gray-900">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                'bg-gradient-to-r from-purple-600 to-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Days Until */}
        {!isPast && (
          <p className="text-sm font-semibold text-purple-600 mt-4">
            {days === 0 ? '🎉 Trip starts today!' : `${days} days to go`}
          </p>
        )}
      </div>
    </Link>
  )
}
