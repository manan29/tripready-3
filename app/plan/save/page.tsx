'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { createClient } from '@/lib/supabase/client';

export default function SavePendingTripPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [status, setStatus] = useState<'loading' | 'saving' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    savePendingTrip();
  }, []);

  const savePendingTrip = async () => {
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/plan/save');
        return;
      }

      // Get pending trip from localStorage
      const pendingTripStr = localStorage.getItem('pendingTrip');
      if (!pendingTripStr) {
        // No pending trip, go to trips
        router.push('/trips');
        return;
      }

      setStatus('saving');
      const { tripData, tripPlan, flightTrends, destinationImage } = JSON.parse(pendingTripStr);

      // Calculate end date
      const endDate = new Date(tripData.start_date);
      endDate.setDate(endDate.getDate() + (tripData.duration || 7) - 1);

      // Build packing list
      const packingList = [
        ...(tripPlan?.packing_list?.kids || []).map((item: string, i: number) => ({ id: `k${i}`, text: item, checked: false, category: 'kids' })),
        ...(tripPlan?.packing_list?.adults || []).map((item: string, i: number) => ({ id: `a${i}`, text: item, checked: false, category: 'adults' })),
        ...(tripPlan?.packing_list?.indian_essentials || []).map((item: string, i: number) => ({ id: `i${i}`, text: item, checked: false, category: 'indian' })),
      ];

      // Save to database
      const { data, error } = await supabase.from('trips').insert({
        user_id: user.id,
        destination: tripData.destination,
        start_date: tripData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        num_adults: tripData.adults || 2,
        num_kids: tripData.kids || 0,
        kid_ages: tripData.kid_ages || [],
        health_notes: tripData.health_conditions || '',
        packing_list: packingList,
        trip_preferences: {
          from_city: tripData.from_city,
          airline: tripData.airline,
          hotel_rating: tripData.hotel_rating,
          amenities: tripData.amenities,
          flight_trends: flightTrends,
          honest_take: tripPlan?.honest_take,
          things_to_know: tripPlan?.things_to_know,
          destination_image: destinationImage,
        },
      }).select().single();

      if (error) throw error;

      // Clear pending trip
      localStorage.removeItem('pendingTrip');
      sessionStorage.removeItem('tripPlan');

      setStatus('success');

      // Redirect to trip detail after short delay
      setTimeout(() => {
        router.push(`/trips/${data.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Failed to save trip:', err);
      setError(err.message || 'Failed to save trip');
      setStatus('error');
    }
  };

  return (
    <Screen className="flex flex-col items-center justify-center px-5">
      <div className="text-center">
        {status === 'loading' || status === 'saving' ? (
          <>
            <div className="w-20 h-20 rounded-3xl bg-primary-400/20 flex items-center justify-center mb-6 mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              {status === 'loading' ? 'Loading...' : 'Saving your trip...'}
            </h1>
            <p className="text-text-secondary">Just a moment</p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mb-6 mx-auto shadow-glow">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">Trip Saved!</h1>
            <p className="text-text-secondary">Redirecting to your trip...</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center mb-6 mx-auto">
              <Sparkles className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">Oops!</h1>
            <p className="text-text-secondary mb-4">{error || 'Something went wrong'}</p>
            <button 
              onClick={() => router.push('/trips')}
              className="px-6 py-3 bg-primary-400 text-dark-primary rounded-xl font-semibold"
            >
              Go to Trips
            </button>
          </>
        )}
      </div>
    </Screen>
  );
}
