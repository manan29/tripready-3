'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Star, Share2, Download, Camera, TrendingUp, MapPin } from 'lucide-react'
import { getTripDayInfo } from '@/lib/trip-stages'
import { TOP_DESTINATIONS } from '@/lib/destinations'
import { TripStatsCard } from '@/components/stats/TripStatsCard'

interface PostTripViewProps {
  trip: any
  stageData: any
  onUpdateStageData: (data: any) => void
}

export function PostTripView({ trip, stageData, onUpdateStageData }: PostTripViewProps) {
  const dayInfo = getTripDayInfo(trip.start_date, trip.end_date)
  const daysAgo = dayInfo.stage === 'post-trip' ? dayInfo.daysAgo : 0
  const [rating, setRating] = useState(stageData?.post_trip?.rating || 0)
  const [showStatsCard, setShowStatsCard] = useState(false)

  const totalSpent = stageData?.post_trip?.total_spent || 0
  const expenses = stageData?.during_trip?.expenses || []
  const memories = stageData?.during_trip?.memories || []

  // Calculate expense breakdown
  const expenseBreakdown = {
    flights: expenses.filter((e: any) => e.category === 'flights').reduce((sum: number, e: any) => sum + e.amount, 0),
    hotels: expenses.filter((e: any) => e.category === 'hotels').reduce((sum: number, e: any) => sum + e.amount, 0),
    other: expenses.filter((e: any) => !['flights', 'hotels'].includes(e.category)).reduce((sum: number, e: any) => sum + e.amount, 0),
  }

  const handleRating = (stars: number) => {
    setRating(stars)
    onUpdateStageData({
      ...stageData,
      post_trip: {
        ...stageData?.post_trip,
        rating: stars,
      },
    })
  }

  // Suggest destinations based on current trip
  const getSuggestedDestinations = () => {
    // Filter out current destination and pick 3 random
    const filtered = TOP_DESTINATIONS.filter((d) => d.name !== trip.destination)
    return filtered.slice(0, 3)
  }

  const suggestedDestinations = getSuggestedDestinations()

  return (
    <div className="space-y-4 pb-4">
      {/* Completed Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold mb-1">{trip.destination}</h2>
          <p className="text-white/90 text-sm">
            {new Date(trip.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} -{' '}
            {new Date(trip.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-white/80 text-xs mt-2">
            Completed {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
          </p>
        </div>
      </div>

      {/* Rating */}
      <GlassCard>
        <h3 className="font-bold text-gray-800 mb-3 text-center">How was your trip?</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm text-gray-500">
            {rating === 5
              ? 'Amazing! 🤩'
              : rating === 4
              ? 'Great trip! 😊'
              : rating === 3
              ? 'Good experience 👍'
              : rating === 2
              ? 'Could be better 🤔'
              : 'Not great 😕'}
          </p>
        )}
      </GlassCard>

      {/* Expense Summary */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-800">Expense Summary</h3>
        </div>

        {expenses.length > 0 ? (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-3xl font-bold text-purple-600">
                ₹{totalSpent > 0 ? totalSpent.toLocaleString() : expenseBreakdown.flights + expenseBreakdown.hotels + expenseBreakdown.other}
              </p>
            </div>

            <div className="space-y-3">
              {expenseBreakdown.flights > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">✈️ Flights</span>
                    <span className="text-sm font-semibold text-gray-800">₹{expenseBreakdown.flights.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${(expenseBreakdown.flights / (totalSpent || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {expenseBreakdown.hotels > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">🏨 Hotels</span>
                    <span className="text-sm font-semibold text-gray-800">₹{expenseBreakdown.hotels.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500"
                      style={{ width: `${(expenseBreakdown.hotels / (totalSpent || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {expenseBreakdown.other > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">🍽️ Other</span>
                    <span className="text-sm font-semibold text-gray-800">₹{expenseBreakdown.other.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(expenseBreakdown.other / (totalSpent || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-2 border-2 border-purple-200 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No expenses tracked</p>
          </div>
        )}
      </GlassCard>

      {/* Memories */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-800">Memories</h3>
          </div>
          <span className="text-sm text-gray-500">{memories.length} photos</span>
        </div>

        {memories.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {memories.slice(0, 9).map((memory: any, idx: number) => (
              <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {/* Photo thumbnail would go here */}
                <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
            <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No memories added</p>
          </div>
        )}
      </GlassCard>

      {/* Share */}
      <GlassCard>
        <h3 className="font-bold text-gray-800 mb-3">Share Your Journey</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowStatsCard(true)}
            className="py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-600 transition-all shadow-md"
          >
            <Camera className="w-5 h-5" />
            Stats Card
          </button>
          <button className="py-4 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
            <Download className="w-5 h-5" />
            Create PDF
          </button>
        </div>
      </GlassCard>

      {/* Suggested Next Destinations */}
      <GlassCard>
        <h3 className="font-bold text-gray-800 mb-3">Plan Your Next Adventure</h3>
        <div className="space-y-2">
          {suggestedDestinations.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <span className="text-3xl">{dest.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{dest.name}</p>
                <p className="text-xs text-gray-500">{dest.country}</p>
              </div>
              <MapPin className="w-4 h-4 text-purple-400" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Stats Card Modal */}
      {showStatsCard && (
        <TripStatsCard trip={trip} stageData={stageData} onClose={() => setShowStatsCard(false)} />
      )}
    </div>
  )
}
