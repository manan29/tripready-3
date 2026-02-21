'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  photos?: string[];
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
      setTrips(trips.filter(t => t.id !== tripId));
      setMenuOpen(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
    }
  };

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const tripsByYear = trips.reduce((acc, trip) => {
    const year = new Date(trip.start_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(trip);
    return acc;
  }, {} as Record<number, Trip[]>);

  const years = Object.keys(tripsByYear).map(Number).sort((a, b) => b - a);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameMonth = startDate.getMonth() === endDate.getMonth();

    if (sameMonth) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startDate.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A7A6E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#6B6B6B] mt-4">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-6 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My Trips</h1>
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-sm text-[#6B6B6B]">{trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned</p>
      </header>

      {/* Content */}
      {trips.length === 0 ? (
        <div className="px-5 pt-20 text-center">
          <div className="w-20 h-20 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-[#0A7A6E]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No trips yet</h2>
          <p className="text-[#6B6B6B] mb-6">Start planning your first family adventure</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#0A7A6E] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Plan a Trip
          </button>
        </div>
      ) : (
        <div className="px-5 pt-4">
          {years.map((year) => {
            const isExpanded = expandedYears.has(year);
            const yearTrips = tripsByYear[year];

            return (
              <div key={year} className="mb-6">
                {/* Year Header */}
                <button
                  onClick={() => toggleYear(year)}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
                    )}
                    <h2 className="text-lg font-bold text-[#1A1A1A]">{year}</h2>
                    <span className="text-sm text-[#9CA3AF]">({yearTrips.length})</span>
                  </div>
                </button>

                {/* Trips */}
                {isExpanded && (
                  <div className="space-y-3">
                    {yearTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="relative rounded-2xl overflow-hidden border border-[#F0F0F0] bg-white"
                      >
                        {/* Trip Card */}
                        <button
                          onClick={() => router.push(`/trips/${trip.id}`)}
                          className="w-full text-left"
                        >
                          <div className="relative h-40">
                            <img
                              src={trip.photos?.[0] || getDestinationImage(trip.destination)}
                              alt={trip.destination}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 overlay-gradient"></div>
                            <div className="absolute bottom-3 left-4 right-12">
                              <h3 className="text-white font-bold text-lg mb-1">{trip.destination}</h3>
                              <p className="text-white/90 text-sm">{formatDateRange(trip.start_date, trip.end_date)}</p>
                            </div>
                          </div>
                        </button>

                        {/* Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === trip.id ? null : trip.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
                        >
                          <MoreVertical className="w-4 h-4 text-[#1A1A1A]" />
                        </button>

                        {/* Dropdown Menu */}
                        {menuOpen === trip.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setMenuOpen(null)}
                            ></div>
                            <div className="absolute top-12 right-3 bg-white rounded-xl shadow-lg border border-[#F0F0F0] py-2 z-30 min-w-[140px]">
                              <button
                                onClick={() => {
                                  router.push(`/trips/${trip.id}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-[#1A1A1A] hover:bg-[#F8F7F5]"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => deleteTrip(trip.id)}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Trip
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
