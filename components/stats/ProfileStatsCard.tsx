'use client'

import { useRef } from 'react'
import { X } from 'lucide-react'
import { calculateTotalAirMiles, formatAirMiles } from '@/lib/air-miles'

interface ProfileStatsCardProps {
  trips: any[]
  user: any
  type: 'overall' | 'year'
  year?: number
  onClose?: () => void
}

export function ProfileStatsCard({
  trips,
  user,
  type,
  year = new Date().getFullYear(),
  onClose,
}: ProfileStatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Filter trips
  const filteredTrips =
    type === 'year' ? trips.filter((t) => new Date(t.start_date).getFullYear() === year) : trips

  // Calculate stats
  const totalTrips = filteredTrips.length

  const totalDays = filteredTrips.reduce((sum, t) => {
    const days = Math.ceil((new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return sum + days
  }, 0)

  const totalAirMiles = calculateTotalAirMiles(filteredTrips)

  // Unique countries and cities
  const countries = [...new Set(filteredTrips.map((t) => t.country || t.destination))]
  const cities = [...new Set(filteredTrips.flatMap((t) => (t.cities ? t.cities : [t.destination])))]

  // Estimated places (based on days)
  const totalPlaces = filteredTrips.reduce((sum, t) => {
    const days = Math.ceil((new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return sum + Math.floor(days * 1.5)
  }, 0)

  // Most visited
  const destCounts = filteredTrips.reduce((acc: Record<string, number>, t) => {
    const dest = t.destination
    acc[dest] = (acc[dest] || 0) + 1
    return acc
  }, {})
  const mostVisited = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0]

  // Longest trip
  const longestTrip = filteredTrips.reduce((longest, t) => {
    const days = Math.ceil((new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    const longestDays = longest
      ? Math.ceil((new Date(longest.end_date).getTime() - new Date(longest.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0
    return days > longestDays ? t : longest
  }, null as any)

  // Family trips count
  const familyTrips = filteredTrips.filter((t) => t.num_kids > 0).length

  const handleSaveImage = async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null })
      const link = document.createElement('a')
      link.download = type === 'year' ? `travel-${year}-wrapped.png` : 'my-travel-story.png'
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
        const file = new File([blob], 'travel-stats.png', { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: type === 'year' ? `My ${year} Travel Wrapped` : 'My Travel Story',
          })
        } else {
          handleSaveImage()
        }
      })
    } catch (error) {
      console.error('Error sharing:', error)
      handleSaveImage()
    }
  }

  // Country flag helper
  const getFlag = (country: string): string => {
    const flags: Record<string, string> = {
      UAE: '🇦🇪',
      Dubai: '🇦🇪',
      'Abu Dhabi': '🇦🇪',
      Singapore: '🇸🇬',
      Thailand: '🇹🇭',
      Bangkok: '🇹🇭',
      Phuket: '🇹🇭',
      Malaysia: '🇲🇾',
      'Kuala Lumpur': '🇲🇾',
      Indonesia: '🇮🇩',
      Bali: '🇮🇩',
      Maldives: '🇲🇻',
      'Sri Lanka': '🇱🇰',
      Japan: '🇯🇵',
      Tokyo: '🇯🇵',
      Vietnam: '🇻🇳',
    }
    return flags[country] || '🌍'
  }

  if (totalTrips === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl p-12 text-center max-w-sm">
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          )}
          <p className="text-6xl mb-4">🧳</p>
          <p className="text-gray-600">No trips yet for {type === 'year' ? year : 'sharing'}</p>
        </div>
      </div>
    )
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
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-5xl">🌍</span>
            <h2 className="text-xl font-bold mt-2">{type === 'year' ? `MY ${year} WRAPPED` : 'MY TRAVEL STORY'}</h2>
            <p className="text-white/70 text-sm">@{user?.name || user?.email?.split('@')[0] || 'traveler'}</p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3">
              <p className="text-2xl font-bold">{totalTrips}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Trips</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3">
              <p className="text-2xl font-bold">{totalDays}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Days</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3">
              <p className="text-2xl font-bold">{formatAirMiles(totalAirMiles)}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Air Miles</p>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold">{totalPlaces}</p>
              <p className="text-[10px] text-white/70 uppercase">Places</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{cities.length}</p>
              <p className="text-[10px] text-white/70 uppercase">Cities</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{countries.length}</p>
              <p className="text-[10px] text-white/70 uppercase">Countries</p>
            </div>
          </div>

          {/* Country Flags */}
          <div className="text-center mb-4">
            <p className="text-3xl tracking-wider">
              {countries
                .slice(0, 6)
                .map((c) => getFlag(c))
                .join(' ')}
            </p>
          </div>

          {/* Highlights */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-4 space-y-1">
            <p className="text-xs text-white/70 mb-2">🏆 Highlights</p>
            {mostVisited && <p className="text-sm">📍 Most Visited: {mostVisited[0]} ({mostVisited[1]}x)</p>}
            {longestTrip && (
              <p className="text-sm">
                ✈️ Longest: {longestTrip.destination} (
                {Math.ceil(
                  (new Date(longestTrip.end_date).getTime() - new Date(longestTrip.start_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1}{' '}
                days)
              </p>
            )}
            {familyTrips > 0 && <p className="text-sm">👶 Family Adventures: {familyTrips}</p>}
          </div>

          {/* Year trips timeline */}
          {type === 'year' && (
            <div className="mb-4 space-y-1">
              {filteredTrips.slice(0, 4).map((t) => (
                <p key={t.id} className="text-sm text-white/80">
                  {new Date(t.start_date).toLocaleDateString('en-US', { month: 'short' })}: {t.destination} {getFlag(t.country || t.destination)}
                </p>
              ))}
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
