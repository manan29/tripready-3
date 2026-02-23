'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SavePlanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState('Saving your trip...');

  useEffect(() => {
    savePendingTrip();
  }, []);

  const savePendingTrip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/plan/save');
        return;
      }

      const pending = localStorage.getItem('pendingTrip');
      if (!pending) {
        router.push('/');
        return;
      }

      const { tripData, tripPlan } = JSON.parse(pending);

      if (tripData.remember_prefs) {
        setStatus('Saving your preferences...');
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            family_members: tripData.kid_details?.map((k: any) => ({
              name: k.name, age: k.age, relation: 'child', health_notes: k.health_notes
            })) || [],
            preferred_airlines: tripData.airlines || [],
            preferred_hotel_rating: tripData.hotel_rating || 4,
            preferred_amenities: tripData.amenities || [],
          }),
        });
      }

      setStatus('Creating your trip...');

      const startDate = new Date(tripData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + tripData.duration - 1);

      const packingList = [
        ...(tripPlan.packing_list?.priority_items || []).map((item: any, i: number) => ({
          id: `p${i}`, text: item.item, checked: false, category: 'priority', reason: item.reason
        })),
        ...(tripPlan.packing_list?.kids_items || []).map((item: any, i: number) => ({
          id: `k${i}`, text: item.item, checked: false, category: 'kids'
        })),
        ...(tripPlan.packing_list?.adult_items || []).map((item: any, i: number) => ({
          id: `a${i}`, text: item.item, checked: false, category: 'adults'
        })),
      ];

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: tripPlan.selected_destination?.name || 'Maldives',
          country: tripPlan.selected_destination?.country || '',
          start_date: tripData.start_date,
          end_date: endDate.toISOString().split('T')[0],
          num_adults: tripData.adults,
          num_kids: tripData.kids,
          kid_ages: tripData.kid_details?.map((k: any) => k.age) || [],
          health_notes: tripData.kid_details?.map((k: any) => `${k.name || 'Child'}: ${k.health_notes}`).filter((n: string) => n.includes(':')).join('; ') || '',
          packing_list: packingList,
          trip_preferences: {
            hotel_rating: tripData.hotel_rating,
            amenities: tripData.amenities,
            airlines: tripData.airlines,
            flight_recommendation: tripPlan.flight_recommendation,
            hotel_recommendation: tripPlan.hotel_recommendation,
            health_tips: tripPlan.health_specific_tips,
            budget: tripPlan.estimated_budget,
            destination_info: tripPlan.destination_info
          },
          stage_data: { pre_trip: { completed_steps: ['packing'] } }
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.removeItem('pendingTrip');
      sessionStorage.removeItem('tripPlan');

      router.push(`/trips/${data.id}`);

    } catch (error) {
      console.error('Failed to save:', error);
      setStatus('Failed to save. Redirecting...');
      setTimeout(() => router.push('/'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5">
      <Loader2 className="w-12 h-12 text-[#0A7A6E] animate-spin mb-4" />
      <h2 className="text-xl font-bold text-[#1A1A1A]">{status}</h2>
    </div>
  );
}
