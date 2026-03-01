'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

const AIRLINES = [
  { id: 'emirates', label: 'Emirates' },
  { id: 'indigo', label: 'IndiGo' },
  { id: 'air_india', label: 'Air India' },
  { id: 'vistara', label: 'Vistara' },
  { id: 'no_pref', label: 'No preference' },
];

const AMENITIES = [
  { id: 'metro', label: 'Near Metro', icon: '🚇' },
  { id: 'central', label: 'Central Location', icon: '🏙️' },
  { id: 'indian_food', label: 'Indian Restaurants Nearby', icon: '🍛' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
  { id: 'kids_friendly', label: 'Kids Friendly', icon: '👶' },
  { id: 'beach', label: 'Beach Access', icon: '🏖️' },
];

export default function PreferencesPage() {
  const router = useRouter();

  const [airline, setAirline] = useState('no_pref');
  const [hotelRating, setHotelRating] = useState(4);
  const [amenities, setAmenities] = useState<string[]>(['indian_food']);
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('tripPlan');
    if (stored) setTripData(JSON.parse(stored));
    else router.push('/plan');
  }, []);

  const toggleAmenity = (id: string) => {
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handlePlanTrip = () => {
    const fullData = {
      ...tripData,
      airline,
      hotel_rating: hotelRating,
      amenities,
    };
    sessionStorage.setItem('tripPlan', JSON.stringify(fullData));
    router.push('/plan/magic');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Your preferences</h1>
            <p className="text-sm text-[#6B6B6B]">Step 2 of 2</p>
          </div>
        </div>
        <button onClick={handlePlanTrip} className="text-[#0A7A6E] font-medium">Skip</button>
      </header>

      <div className="px-5 py-4 space-y-6 pb-32">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">✈️ Preferred airline</label>
          <div className="flex flex-wrap gap-2">
            {AIRLINES.map((a) => (
              <button key={a.id} onClick={() => setAirline(a.id)} className={`px-4 py-2 rounded-xl text-sm font-medium ${airline === a.id ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">🏨 Hotel preference</label>
          <div className="flex gap-2">
            {[3, 4, 5].map((rating) => (
              <button key={rating} onClick={() => setHotelRating(rating)} className={`flex-1 py-3 rounded-xl font-medium ${hotelRating === rating ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'}`}>
                {rating}⭐
              </button>
            ))}
            <button onClick={() => setHotelRating(0)} className={`flex-1 py-3 rounded-xl font-medium ${hotelRating === 0 ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'}`}>
              Any
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">📍 Must have (select any)</label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map((amenity) => (
              <button key={amenity.id} onClick={() => toggleAmenity(amenity.id)} className={`py-3 px-3 rounded-xl text-sm font-medium flex items-center gap-2 ${amenities.includes(amenity.id) ? 'bg-[#F0FDFA] text-[#0A7A6E] border-2 border-[#0A7A6E]' : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'}`}>
                <span>{amenity.icon}</span>
                <span className="flex-1 text-left">{amenity.label}</span>
                {amenities.includes(amenity.id) && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F0F0F0]">
        <button onClick={handlePlanTrip} className="w-full py-4 rounded-xl font-semibold bg-[#0A7A6E] text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          Plan My Trip
        </button>
      </div>
    </div>
  );
}
