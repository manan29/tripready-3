'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';
import { PreTripView } from '@/components/trips/stages/PreTripView';
import { DuringTripView } from '@/components/trips/stages/DuringTripView';
import { PostTripView } from '@/components/trips/stages/PostTripView';

type Stage = 'pre' | 'during' | 'post';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const supabase = createClient();

  const [trip, setTrip] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<Stage>('pre');

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);

      const { data: tripData, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error || !tripData) {
        router.push('/trips');
        return;
      }

      setTrip(tripData);

      // Auto-detect stage based on dates
      const today = new Date();
      const start = new Date(tripData.start_date);
      const end = new Date(tripData.end_date);

      if (today < start) setActiveStage('pre');
      else if (today >= start && today <= end) setActiveStage('during');
      else setActiveStage('post');
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameMonth = startDate.getMonth() === endDate.getMonth();

    if (sameMonth) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startDate.getFullYear()}`;
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A7A6E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#6B6B6B] mt-4">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="relative h-64">
        <img
          src={trip.photos?.[0] || getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 overlay-gradient"></div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 px-5 pt-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <button onClick={() => router.push('/profile')} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-[#0A7A6E] font-bold">{userName?.charAt(0).toUpperCase() || 'U'}</span>
          </button>
        </div>

        {/* Trip Info */}
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-white text-2xl font-bold mb-1">{trip.destination}</h1>
          <p className="text-white/90 text-sm">{formatDateRange(trip.start_date, trip.end_date)}</p>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="px-5 pt-6 pb-4 border-b border-[#F0F0F0]">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveStage('pre')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
              activeStage === 'pre' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}
          >
            Pre-Trip
          </button>
          <button
            onClick={() => setActiveStage('during')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
              activeStage === 'during' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}
          >
            During
          </button>
          <button
            onClick={() => setActiveStage('post')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
              activeStage === 'post' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}
          >
            Post-Trip
          </button>
        </div>
      </div>

      {/* Stage Content */}
      <div className="px-5 pt-6">
        {activeStage === 'pre' && <PreTripView trip={trip} />}
        {activeStage === 'during' && <DuringTripView trip={trip} />}
        {activeStage === 'post' && <PostTripView trip={trip} />}
      </div>

      <BottomNav />
    </div>
  );
}
