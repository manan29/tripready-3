'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, Backpack, Calendar, Map } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';

const suggestionChips = [
  "Dubai with 2 kids",
  "Singapore family trip",
  "Thailand in March",
  "Bali beach vacation",
  "Maldives luxury",
];

const features = [
  {
    icon: Backpack,
    title: 'AI Packing Lists',
    description: 'Smart lists based on kids\' ages',
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Calendar,
    title: 'Trip Planning',
    description: 'Flights, hotels, visa in one place',
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Map,
    title: 'Travel Insights',
    description: 'Weather, currency, local tips',
    color: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

const destinations = [
  { name: 'Dubai', country: 'UAE', famousFor: 'Burj Khalifa & Desert Safari' },
  { name: 'Singapore', country: 'Singapore', famousFor: 'Universal Studios & Marina Bay' },
  { name: 'Thailand', country: 'Bangkok', famousFor: 'Grand Palace & Beaches' },
  { name: 'Bali', country: 'Indonesia', famousFor: 'Temples & Rice Terraces' },
  { name: 'Maldives', country: 'Maldives', famousFor: 'Overwater Villas & Snorkeling' },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/trips/new?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChipClick = (chip: string) => {
    router.push(`/trips/new?query=${encodeURIComponent(chip)}`);
  };

  const handleDestinationClick = (dest: string) => {
    router.push(`/trips/new?query=${encodeURIComponent(dest + ' family trip with kids')}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] ||
                   user?.email?.split('@')[0] || null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6B6B6B] text-sm">{getGreeting()}{userName ? `, ${userName}` : ''}</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Plan your next trip</h1>
          </div>
          {user ? (
            <button onClick={() => router.push('/profile')} className="w-10 h-10 bg-[#F0FDFA] rounded-full flex items-center justify-center">
              <span className="text-[#0A7A6E] font-bold">{userName?.charAt(0).toUpperCase() || 'U'}</span>
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="text-sm font-semibold text-[#0A7A6E]">Sign In</button>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 bg-[#F8F7F5] rounded-2xl px-4 py-4 border border-[#E5E5E5]">
          <Sparkles className="w-5 h-5 text-[#0A7A6E] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Plan a trip with AI..."
            className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-[#9CA3AF]"
          />
          {query && (
            <button onClick={handleSearch} className="bg-[#0A7A6E] text-white px-4 py-2 rounded-xl text-sm font-semibold">
              Go
            </button>
          )}
        </div>
        <p className="text-center text-xs text-[#9CA3AF] mt-2">Try: "Dubai with 2 kids in March"</p>
      </div>

      {/* Chips */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4 scrollbar-hide">
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="flex-shrink-0 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-full text-sm hover:border-[#0A7A6E] hover:text-[#0A7A6E] transition-colors whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Features */}
      <section className="px-5 mb-8">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">What JourneyAI Can Do</h2>
        <div className="space-y-3">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#F0F0F0]">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center`}>
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">{f.title}</h3>
                <p className="text-sm text-[#6B6B6B]">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="px-5 mb-8">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Popular Destinations</h2>
        <div className="space-y-3">
          {destinations.map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleDestinationClick(dest.name)}
              className="w-full flex gap-4 bg-white rounded-2xl overflow-hidden border border-[#F0F0F0] hover:border-[#0A7A6E] transition-all text-left"
            >
              <div className="w-24 h-24 flex-shrink-0">
                <img src={getDestinationImage(dest.name)} alt={dest.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 py-3 pr-3 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#1A1A1A]">{dest.name}</h3>
                    <p className="text-sm text-[#6B6B6B]">{dest.country}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <p className="text-xs text-[#0A7A6E] mt-1">{dest.famousFor}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
