'use client'

import { GlassCard } from '@/components/ui/GlassCard'

interface TripCardGlassProps {
  id: string
  destination: string
  emoji: string
  date: string
  travelers: number
  status?: 'upcoming' | 'completed' | 'in-progress'
  onClick?: () => void
}

export function TripCardGlass({
  destination,
  emoji,
  date,
  travelers,
  status,
  onClick,
}: TripCardGlassProps) {
  return (
    <GlassCard onClick={onClick} className="w-40 flex-shrink-0 relative">
      {/* Status badge */}
      {status === 'completed' && (
        <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
          Completed
        </span>
      )}
      {status === 'in-progress' && (
        <span className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
          Ongoing
        </span>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Emoji */}
        <span className="text-4xl mb-3">{emoji}</span>

        {/* Destination */}
        <h3 className="font-bold text-gray-800 text-lg">{destination}</h3>

        {/* Details */}
        <p className="text-gray-500 text-xs mt-2">📅 {date}</p>
        <p className="text-gray-500 text-xs">👥 {travelers} travelers</p>
      </div>
    </GlassCard>
  )
}
