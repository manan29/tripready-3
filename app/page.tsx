'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, Backpack, Calendar, MapPin } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';

const QUICK_CHIPS = [
  'Beach trip with kids',
  'Dubai family vacation',
  'Singapore with toddler',
  'Maldives luxury trip',
  'Thailand in March',
];

const FEATURES = [
  { icon: Backpack, title: 'AI Packing Lists', desc: 'Smart lists based on kids\' ages & health needs' },
  { icon: Calendar, title: 'Trip Planning', desc: 'Flights, hotels, visa in one place' },
  { icon: MapPin, title: 'Travel Insights', desc: 'Weather, currency, emergency contacts' },
];

const DESTINATIONS = [
  { name: 'Dubai', country: 'UAE', tagline: 'Burj Khalifa & Desert Safari' },
  { name: 'Singapore', country: 'Singapore', tagline: 'Universal Studios & Marina Bay' },
  { name: 'Thailand', country: 'Bangkok', tagline: 'Grand Palace & Beaches' },
  { name: 'Bali', country: 'Indonesia', tagline: 'Temples & Rice Terraces' },
  { name: 'Maldives', country: 'Maldives', tagline: 'Overwater Villas & Snorkeling' },
];

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: searchQuery }));
      router.push('/plan');
    }
  };

  const handleChipClick = (chip: string) => {
    sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: chip }));
    router.push('/plan');
  };

  const handleDestinationClick = (destination: string) => {
    sessionStorage.setItem('tripPlan', JSON.stringify({
      freeform_query: `Family trip to ${destination}`,
      destination: destination,
      suggest_destination: false
    }));
    router.push('/plan');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {greeting}{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-[#6B6B6B]">Plan your next adventure</p>
        </div>
        {user ? (
          <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}</span>
          </div>
        ) : (
          <button onClick={() => router.push('/login')} className="text-[#0A7A6E] font-semibold">Sign In</button>
        )}
      </header>

      <div className="px-5 space-y-6">
        <div>
          <div className="flex items-center gap-3 bg-[#F8F7F5] rounded-2xl px-4 py-4 border border-[#E5E5E5]">
            <Sparkles className="w-5 h-5 text-[#0A7A6E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Plan a trip with AI..."
              className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-[#9CA3AF]"
            />
            {searchQuery && (
              <button onClick={handleSearch} className="bg-[#0A7A6E] text-white px-4 py-2 rounded-xl text-sm font-semibold">Go</button>
            )}
          </div>
          <p className="text-center text-[#9CA3AF] text-sm mt-2">Try: "Beach trip with my 5 year old who has dust allergies"</p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
          {QUICK_CHIPS.map((chip) => (
            <button key={chip} onClick={() => handleChipClick(chip)} className="flex-shrink-0 px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] whitespace-nowrap">
              {chip}
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">What JourneyAI Can Do</h2>
          <div className="space-y-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 bg-[#F8F7F5] rounded-2xl p-4">
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-[#0A7A6E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{feature.title}</h3>
                  <p className="text-sm text-[#6B6B6B]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">Popular Destinations</h2>
          <div className="space-y-3">
            {DESTINATIONS.map((dest) => (
              <button key={dest.name} onClick={() => handleDestinationClick(dest.name)} className="w-full flex items-center gap-4 bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
                <img src={getDestinationImage(dest.name)} alt={dest.name} className="w-24 h-24 object-cover" />
                <div className="flex-1 text-left py-3">
                  <h3 className="font-semibold text-[#1A1A1A]">{dest.name}</h3>
                  <p className="text-sm text-[#6B6B6B]">{dest.country}</p>
                  <p className="text-sm text-[#0A7A6E] mt-1">{dest.tagline}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9CA3AF] mr-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
