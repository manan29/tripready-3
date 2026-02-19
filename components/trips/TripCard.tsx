import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Users, MoreVertical, Trash2 } from 'lucide-react'
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
  onClick?: () => void
  onDelete?: (tripId: string) => void
}

export function TripCard({ trip, onClick, onDelete }: TripCardProps) {
  const { gradient, icon } = getTripVisuals(trip.destination)
  const days = daysUntil(trip.start_date)
  const isPast = days < 0
  const isActive = trip.status === 'active'
  const progress = trip.progress || 0
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false)
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div className="relative">
      <Link
        href={onClick ? '#' : `/trips/${trip.id}`}
        onClick={handleCardClick}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
      >
      {/* Gradient Header with Icon */}
      <div className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <span className="text-5xl">{icon}</span>
        {isActive && (
          <span className="absolute top-3 left-3 text-xs bg-white/90 text-green-700 px-2 py-1 rounded-full font-medium">
            Active
          </span>
        )}
        {isPast && !isActive && (
          <span className="absolute top-3 left-3 text-xs bg-white/90 text-gray-500 px-2 py-1 rounded-full font-medium">
            Completed
          </span>
        )}

        {/* 3-dot menu button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/40 bg-white/80 shadow-sm z-10 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>

      {/* Trip Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {trip.destination}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(trip.start_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{trip.adults + trip.kids}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Preparation</span>
            <span className="font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress >= 80 ? 'bg-green-500' :
                progress >= 50 ? 'bg-yellow-500' :
                'bg-primary-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Days Until */}
        {!isPast && (
          <p className="text-sm font-medium text-primary-600 mt-3">
            {days === 0 ? '🎉 Trip starts today!' : `${days} days to go`}
          </p>
        )}
      </div>
    </Link>

      {/* Dropdown menu */}
      {showMenu && onDelete && (
        <div
          className="absolute top-12 right-2 bg-white shadow-lg rounded-xl py-1 z-20 border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(trip.id)
              setShowMenu(false)
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Trip
          </button>
        </div>
      )}
    </div>
  )
}
