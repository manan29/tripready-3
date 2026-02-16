'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { Search, TrendingUp, MapPin, Star, Users } from 'lucide-react'

const trendingDestinations = [
  {
    id: 1,
    name: 'Dubai',
    country: 'UAE',
    emoji: '☀️',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
    travelers: '2.1M',
    rating: 4.8,
    tags: ['Luxury', 'Shopping', 'Architecture'],
  },
  {
    id: 2,
    name: 'Bangkok',
    country: 'Thailand',
    emoji: '🌴',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400',
    travelers: '1.8M',
    rating: 4.7,
    tags: ['Culture', 'Food', 'Nightlife'],
  },
  {
    id: 3,
    name: 'Singapore',
    country: 'Singapore',
    emoji: '🏙️',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400',
    travelers: '1.5M',
    rating: 4.9,
    tags: ['Family', 'Modern', 'Clean'],
  },
  {
    id: 4,
    name: 'Bali',
    country: 'Indonesia',
    emoji: '🏝️',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
    travelers: '1.2M',
    rating: 4.6,
    tags: ['Beach', 'Nature', 'Wellness'],
  },
]

const allDestinations = [
  { name: 'Dubai', country: 'UAE', emoji: '☀️' },
  { name: 'Bangkok', country: 'Thailand', emoji: '🌴' },
  { name: 'Singapore', country: 'Singapore', emoji: '🏙️' },
  { name: 'Bali', country: 'Indonesia', emoji: '🏝️' },
  { name: 'Kuala Lumpur', country: 'Malaysia', emoji: '🦜' },
  { name: 'Male', country: 'Maldives', emoji: '🐚' },
  { name: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { name: 'Seoul', country: 'South Korea', emoji: '🏯' },
  { name: 'Phuket', country: 'Thailand', emoji: '🌊' },
  { name: 'Hong Kong', country: 'China', emoji: '🏮' },
  { name: 'Colombo', country: 'Sri Lanka', emoji: '🐘' },
  { name: 'Kathmandu', country: 'Nepal', emoji: '🏔️' },
]

export default function ExplorePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDestinations = allDestinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-100 to-transparent px-5 pt-6 pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Explore</h1>
        <p className="text-gray-500 mb-6">Discover your next adventure</p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 outline-none focus:ring-2 focus:ring-purple-300 transition-all"
          />
        </div>
      </div>

      {/* Trending Destinations */}
      {!searchQuery && (
        <div className="px-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Trending Destinations
          </h2>

          <div className="space-y-4">
            {trendingDestinations.map((dest) => (
              <GlassCard key={dest.id} className="overflow-hidden cursor-pointer card-hover">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {dest.emoji}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{dest.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{dest.country}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {dest.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {dest.travelers}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap">
                      {dest.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Destinations Grid */}
      <div className="px-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          {searchQuery ? 'Search Results' : 'All Destinations'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {filteredDestinations.map((dest, idx) => (
            <GlassCard
              key={idx}
              onClick={() => router.push(`/?destination=${dest.name}`)}
              className="cursor-pointer text-center"
            >
              <div className="text-4xl mb-2">{dest.emoji}</div>
              <h3 className="font-medium text-gray-900 text-sm">{dest.name}</h3>
              <p className="text-xs text-gray-500">{dest.country}</p>
            </GlassCard>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">No destinations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
