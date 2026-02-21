'use client';

import { useState } from 'react';
import { Star, Share2, Camera, Plane, MapPin, Clock } from 'lucide-react';

interface PostTripViewProps {
  trip: any;
  stageData: any;
  onUpdateStageData: (data: any) => void;
}

// Air miles calculator (simplified)
function calculateAirMiles(destination: string): number {
  const distances: Record<string, number> = {
    'singapore': 2500,
    'dubai': 1900,
    'uae': 1900,
    'thailand': 2100,
    'bali': 3800,
    'indonesia': 3800,
    'malaysia': 2400,
    'maldives': 1800,
    'japan': 4500,
    'default': 2000,
  };
  return distances[destination?.toLowerCase()] || distances['default'];
}

export function PostTripView({ trip, stageData, onUpdateStageData }: PostTripViewProps) {
  const [rating, setRating] = useState(stageData?.post_trip?.rating || 0);

  // Calculate trip stats
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const airMiles = calculateAirMiles(trip.destination);
  const distanceKm = Math.round(airMiles * 1.6);

  const handleRating = (value: number) => {
    setRating(value);
    onUpdateStageData({
      ...stageData,
      post_trip: {
        ...stageData?.post_trip,
        rating: value,
      },
    });
  };

  const handleShare = async () => {
    // In production, use html2canvas to generate image
    alert('Generating shareable stats card...');
  };

  return (
    <div className="space-y-4">

      {/* Trip Complete Header */}
      <div className="text-center py-4">
        <span className="text-4xl mb-2 block">✨</span>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Trip Complete!</h2>
        <p className="text-[#6B6B6B]">
          {trip.destination} • {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-[#0A7A6E]" />
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{totalDays}</p>
            <p className="text-xs text-[#6B6B6B]">Days</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-[#0A7A6E]" />
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{distanceKm.toLocaleString()}</p>
            <p className="text-xs text-[#6B6B6B]">km Traveled</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center mx-auto mb-2">
              <Plane className="w-6 h-6 text-[#0A7A6E]" />
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{airMiles.toLocaleString()}</p>
            <p className="text-xs text-[#6B6B6B]">Air Miles</p>
          </div>
        </div>
      </div>

      {/* Rate Your Trip */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
        <h3 className="font-semibold text-[#1A1A1A] mb-4 text-center">Rate Your Trip</h3>

        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleRating(value)}
              className="p-1"
            >
              <Star
                className={`w-10 h-10 ${value <= rating ? 'text-amber-400 fill-amber-400' : 'text-[#E5E5E5]'}`}
              />
            </button>
          ))}
        </div>

        <p className="text-sm text-[#6B6B6B] text-center">
          How was your {trip.destination} trip?
        </p>
      </div>

      {/* Trip Highlights / Photos */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">Trip Highlights</h3>

        <div className="flex gap-3">
          {/* Placeholder photos */}
          <div className="w-20 h-20 bg-[#F8F7F5] rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-[#9CA3AF]" />
          </div>
          <div className="w-20 h-20 bg-[#F8F7F5] rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-[#9CA3AF]" />
          </div>
          <button className="w-20 h-20 bg-[#F0FDFA] rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-[#0A7A6E]">
            <span className="text-[#0A7A6E] text-2xl">+</span>
            <span className="text-xs text-[#0A7A6E] font-medium">Add</span>
          </button>
        </div>
      </div>

      {/* Share Stats Button */}
      <button
        onClick={handleShare}
        className="w-full bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        Share Trip Stats
      </button>
    </div>
  );
}
