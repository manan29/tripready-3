'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { TOP_DESTINATIONS } from '@/lib/destinations';
import { MapPin, TrendingUp, Search } from 'lucide-react';

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDestinations = searchQuery
    ? TOP_DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TOP_DESTINATIONS;

  const handleDestinationClick = (destination: typeof TOP_DESTINATIONS[0]) => {
    // Navigate to home with destination pre-filled in search
    router.push(`/?destination=${destination.name}`);
  };

  return (
    <div className="min-h-screen px-5 pt-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
        <p className="text-gray-500">Where are you taking the kids?</p>
      </div>

      {/* Search */}
      <GlassCard className="flex items-center gap-3 mb-6">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search destinations..."
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
        />
      </GlassCard>

      {/* Top Destinations for Indian Families */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          Top Destinations for Families with Kids
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredDestinations.slice(0, 8).map(dest => (
            <GlassCard
              key={dest.id}
              onClick={() => handleDestinationClick(dest)}
              className="text-center cursor-pointer card-hover"
            >
              <span className="text-4xl mb-2 block">{dest.emoji}</span>
              <h3 className="font-semibold text-gray-800">{dest.name}</h3>
              <p className="text-xs text-gray-500">{dest.country}</p>
              <p className="text-xs text-purple-500 mt-1">{dest.kidsHighlights[0]}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* All Destinations */}
      {filteredDestinations.length > 8 && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">All Destinations</h2>
          <div className="space-y-2">
            {filteredDestinations.slice(8).map(dest => (
              <GlassCard
                key={dest.id}
                onClick={() => handleDestinationClick(dest)}
                className="flex items-center gap-4 cursor-pointer"
              >
                <span className="text-2xl">{dest.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{dest.name}</h3>
                  <p className="text-xs text-gray-500">{dest.country} • {dest.currency}</p>
                </div>
                <span className="text-xs text-purple-500">{dest.weatherType}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">No destinations found</p>
        </div>
      )}
    </div>
  );
}
