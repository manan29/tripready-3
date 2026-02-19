'use client'

import { useRef } from 'react'
import { X } from 'lucide-react'
import { calculateAirMiles, formatAirMiles } from '@/lib/air-miles'

interface TripStatsCardProps {
  trip: any
  stageData: any
  onClose?: () => void
}

export function TripStatsCard({ trip, stageData, onClose }: TripStatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate stats
  const totalDays =
    Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1

  const airMiles = calculateAirMiles(trip.destination)
  const travelers = (trip.num_adults || 2) + (trip.num_kids || 0)
  const rating = stageData?.post_trip?.rating || 0

  // Places visited (from memories or default)
  const placesVisited = stageData?.during_trip?.places_visited || []
  const placesCount = placesVisited.length || Math.floor(totalDays * 1.5) // Estimate if not tracked

  // Cities (usually 1-2 for most trips)
  const citiesCount = trip.cities?.length || 1

  // Get emoji for destination
  const getDestinationEmoji = () => {
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
      'hong kong': '🏙️',
      europe: '🏰',
    }
    const destLower = trip.destination?.toLowerCase() || ''
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (destLower.includes(key)) return emoji
    }
    return '🌍'
  }

  const handleSaveImage = async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `${trip.destination}-trip-stats.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    }
  }

  const handleShare = async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 2 })

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'trip-stats.png', { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `My ${trip.destination} Trip`,
            text: `Check out my ${trip.destination} trip! ${totalDays} days, ${formatAirMiles(airMiles)} air miles ✈️`,
          })
        } else {
          // Fallback: just save the image
          handleSaveImage()
        }
      })
    } catch (error) {
      console.error('Error sharing:', error)
      handleSaveImage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-sm w-full">
        {/* Close button */}
        {onClose && (
          <button onClick={onClose} className="absolute -top-12 right-0 text-white p-2">
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Stats Card */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-6 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-6xl">{getDestinationEmoji()}</span>
            <h2 className="text-2xl font-bold mt-3">{trip.destination?.toUpperCase()}</h2>
            <p className="text-white/70 text-sm">
              {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3">
              <p className="text-2xl font-bold">{totalDays}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Days</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3">
              <p className="text-2xl font-bold">{formatAirMiles(airMiles)}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Air Miles</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3">
              <p className="text-2xl font-bold">{travelers}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Travelers</p>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold">{placesCount}</p>
              <p className="text-[10px] text-white/70 uppercase">Places</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{citiesCount}</p>
              <p className="text-[10px] text-white/70 uppercase">Cities</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">1</p>
              <p className="text-[10px] text-white/70 uppercase">Country</p>
            </div>
          </div>

          {/* Rating */}
          {rating > 0 && (
            <div className="text-center mb-4">
              <p className="text-2xl">{'⭐'.repeat(rating)}</p>
            </div>
          )}

          {/* Highlights */}
          {placesVisited.length > 0 && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-4">
              <p className="text-xs text-white/70 mb-1">📍 Highlights</p>
              {placesVisited.slice(0, 3).map((place: string, idx: number) => (
                <p key={idx} className="text-sm">
                  • {place}
                </p>
              ))}
            </div>
          )}

          {/* Family tag */}
          {trip.num_kids > 0 && (
            <div className="text-center mb-4">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                👶 Family trip with {trip.num_kids} kid{trip.num_kids > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-white/20">
            <p className="text-xs text-white/50">journeyai.app</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSaveImage}
            className="flex-1 py-3 bg-white rounded-xl text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            📥 Save Image
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-green-500 rounded-xl text-white font-medium text-sm hover:bg-green-600 transition-colors"
          >
            📤 Share
          </button>
        </div>
      </div>
    </div>
  )
}
