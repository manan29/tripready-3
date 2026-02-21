'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ImageCard } from '@/components/ui/ImageCard';
import { getDestinationImage } from '@/lib/destination-images';

const features = [
  {
    destination: 'bali',
    title: 'AI-Powered Packing',
    subtitle: 'Smart lists for your kids\' ages',
  },
  {
    destination: 'singapore',
    title: 'Trip Planning',
    subtitle: 'Flights, hotels, visa guidance',
  },
];

const destinations = [
  { name: 'Dubai', country: 'UAE' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Thailand', country: 'Bangkok' },
  { name: 'Bali', country: 'Indonesia' },
  { name: 'Maldives', country: 'Maldives' },
];

export default function HomePage() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6B6B6B] text-sm">Good morning</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Where to next?</h1>
          </div>
          <div className="w-10 h-10 bg-[#F0FDFA] rounded-full flex items-center justify-center">
            <span className="text-[#0A7A6E] font-bold">M</span>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-3 bg-[#F8F7F5] rounded-xl px-4 py-3.5">
          <Search className="w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations..."
            className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-[#9CA3AF]"
          />
        </div>
      </div>

      {/* Features */}
      <section className="px-5 mb-8">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">What JourneyAI Can Do</h2>
        <div className="space-y-4">
          {features.map((feature) => (
            <ImageCard
              key={feature.title}
              destination={feature.destination}
              title={feature.title}
              subtitle={feature.subtitle}
              height="md"
            />
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 px-5">Popular Destinations</h2>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {destinations.map((dest) => (
            <div key={dest.name} className="flex-shrink-0 w-36">
              <div className="relative h-44 rounded-2xl overflow-hidden mb-2">
                <img
                  src={getDestinationImage(dest.name)}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-[#1A1A1A]">{dest.name}</h3>
              <p className="text-sm text-[#6B6B6B]">{dest.country}</p>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
