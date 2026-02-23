'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

const AMENITIES = [
  { id: 'metro', label: 'Near Metro', icon: '🚇' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'beach', label: 'Beach Access', icon: '🏖️' },
  { id: 'kids_club', label: 'Kids Club', icon: '👶' },
  { id: 'spa', label: 'Spa', icon: '💆' },
];

const AIRLINES = [
  { id: 'emirates', label: 'Emirates' },
  { id: 'indigo', label: 'IndiGo' },
  { id: 'vistara', label: 'Vistara' },
  { id: 'air_india', label: 'Air India' },
  { id: 'cheapest', label: '💰 Cheapest' },
];

const DESTINATIONS = [
  { id: 'maldives', label: 'Maldives', icon: '🏝️' },
  { id: 'dubai', label: 'Dubai', icon: '🏙️' },
  { id: 'singapore', label: 'Singapore', icon: '🦁' },
  { id: 'thailand', label: 'Thailand', icon: '🏖️' },
  { id: 'bali', label: 'Bali', icon: '🌴' },
];

export default function PreferencesPage() {
  const router = useRouter();

  const [hotelRating, setHotelRating] = useState(4);
  const [amenities, setAmenities] = useState<string[]>(['pool']);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [destination, setDestination] = useState('');
  const [suggestDestination, setSuggestDestination] = useState(true);
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('tripPlan');
    if (stored) {
      setTripData(JSON.parse(stored));
    } else {
      router.push('/plan');
    }
  }, []);

  const toggleAmenity = (id: string) => {
    setAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleAirline = (id: string) => {
    if (id === 'cheapest') {
      setAirlines(['cheapest']);
    } else {
      setAirlines(prev => {
        const without = prev.filter(a => a !== 'cheapest');
        return without.includes(id) ? without.filter(a => a !== id) : [...without, id];
      });
    }
  };

  const handlePlanTrip = () => {
    const fullData = {
      ...tripData,
      hotel_rating: hotelRating,
      amenities,
      airlines,
      destination: suggestDestination ? '' : destination,
      suggest_destination: suggestDestination
    };

    sessionStorage.setItem('tripPlan', JSON.stringify(fullData));
    router.push('/plan/magic');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Preferences</h1>
            <p className="text-sm text-[#6B6B6B]">Step 2 of 2</p>
          </div>
        </div>
        <button onClick={handlePlanTrip} className="text-[#0A7A6E] font-medium">
          Skip
        </button>
      </header>

      <div className="px-5 py-4 space-y-6 pb-32">
        {/* Hotel Rating */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">🏨 Stay preference</label>
          <div className="flex gap-2">
            {[3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setHotelRating(rating)}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-1 ${
                  hotelRating === rating
                    ? 'bg-[#0A7A6E] text-white'
                    : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'
                }`}
              >
                {rating}⭐
              </button>
            ))}
            <button
              onClick={() => setHotelRating(0)}
              className={`flex-1 py-3 rounded-xl font-medium ${
                hotelRating === 0
                  ? 'bg-[#0A7A6E] text-white'
                  : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'
              }`}
            >
              Any
            </button>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Must have (select any)</label>
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`py-3 px-2 rounded-xl text-sm font-medium flex flex-col items-center gap-1 ${
                  amenities.includes(amenity.id)
                    ? 'bg-[#F0FDFA] text-[#0A7A6E] border-2 border-[#0A7A6E]'
                    : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'
                }`}
              >
                <span>{amenity.icon}</span>
                <span>{amenity.label}</span>
                {amenities.includes(amenity.id) && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Airlines */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">✈️ Flight preference</label>
          <div className="flex flex-wrap gap-2">
            {AIRLINES.map((airline) => (
              <button
                key={airline.id}
                onClick={() => toggleAirline(airline.id)}
                className={`py-2 px-4 rounded-xl text-sm font-medium ${
                  airlines.includes(airline.id)
                    ? 'bg-[#0A7A6E] text-white'
                    : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'
                }`}
              >
                {airline.label}
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">🗺️ Destination</label>

          <button
            onClick={() => setSuggestDestination(true)}
            className={`w-full py-4 px-4 rounded-xl text-left mb-3 flex items-center justify-between ${
              suggestDestination
                ? 'bg-[#F0FDFA] border-2 border-[#0A7A6E]'
                : 'bg-[#F8F7F5] border border-[#E5E5E5]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0A7A6E]" />
              <span className="font-medium">Suggest destinations for me</span>
            </div>
            {suggestDestination && <Check className="w-5 h-5 text-[#0A7A6E]" />}
          </button>

          <button
            onClick={() => setSuggestDestination(false)}
            className={`w-full py-4 px-4 rounded-xl text-left mb-3 ${
              !suggestDestination
                ? 'bg-[#F0FDFA] border-2 border-[#0A7A6E]'
                : 'bg-[#F8F7F5] border border-[#E5E5E5]'
            }`}
          >
            <span className="font-medium">I know where I'm going</span>
          </button>

          {!suggestDestination && (
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setDestination(dest.label)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium flex items-center gap-1 ${
                    destination === dest.label
                      ? 'bg-[#0A7A6E] text-white'
                      : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'
                  }`}
                >
                  <span>{dest.icon}</span>
                  <span>{dest.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F0F0F0]">
        <button
          onClick={handlePlanTrip}
          className="w-full py-4 rounded-xl font-semibold bg-[#0A7A6E] text-white flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Plan My Trip
        </button>
      </div>
    </div>
  );
}
