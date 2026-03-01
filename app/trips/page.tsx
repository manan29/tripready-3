'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { BottomNav } from '@/components/navigation/BottomNav';
import { createClient } from '@/lib/supabase/client';
import { getDestinationImage } from '@/lib/destination-images';
import { cn } from '@/lib/design-system/cn';

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  num_adults: number;
  num_kids: number;
  packing_list: any[];
  trip_preferences?: {
    destination_image?: string;
    from_city?: string;
  };
}

export default function TripsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndLoadTrips();
  }, []);

  const checkAuthAndLoadTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    
    setIsLoggedIn(true);
    
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });
    
    if (data) setTrips(data);
    setLoading(false);
  };

  const getPackingProgress = (packingList: any[]) => {
    if (!packingList || packingList.length === 0) return 0;
    const checked = packingList.filter(i => i.checked).length;
    return Math.round((checked / packingList.length) * 100);
  };

  const getDaysToGo = (startDate: string) => {
    const days = Math.ceil((new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getTripStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  };

  // Not Logged In State
  if (!loading && !isLoggedIn) {
    return (
      <Screen className="pb-24">
        <header className="px-5 pt-safe-top">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-neutral-900">Your Trips</h1>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-20">
          <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign in to see your trips</h2>
          <p className="text-neutral-500 text-center mb-8">
            Save trips and access them from anywhere
          </p>
          <Button size="lg" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
        
        <BottomNav />
      </Screen>
    );
  }

  // Loading State
  if (loading) {
    return (
      <Screen className="flex items-center justify-center pb-24">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <BottomNav />
      </Screen>
    );
  }

  // Empty State
  if (trips.length === 0) {
    return (
      <Screen className="pb-24">
        <header className="px-5 pt-safe-top">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-neutral-900">Your Trips</h1>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-20">
          <div className="w-20 h-20 rounded-3xl bg-primary-100 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No trips yet</h2>
          <p className="text-neutral-500 text-center mb-8">
            Plan your first adventure with AI-powered insights
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/')}
            icon={<Plus className="w-5 h-5" />}
          >
            Plan a Trip
          </Button>
        </div>
        
        <BottomNav />
      </Screen>
    );
  }

  // Trips List
  const upcomingTrips = trips.filter(t => getTripStatus(t.start_date, t.end_date) === 'upcoming');
  const ongoingTrips = trips.filter(t => getTripStatus(t.start_date, t.end_date) === 'ongoing');
  const completedTrips = trips.filter(t => getTripStatus(t.start_date, t.end_date) === 'completed');

  return (
    <Screen className="pb-24">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Your Trips</h1>
          <Button 
            size="sm" 
            onClick={() => router.push('/')}
            icon={<Plus className="w-4 h-4" />}
          >
            New
          </Button>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-6">
        {/* Ongoing Trips */}
        {ongoingTrips.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="success">Active Now</Badge>
            </div>
            <div className="space-y-3">
              {ongoingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => router.push(`/trips/${trip.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <section>
            <h2 className="font-semibold text-neutral-700 mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => router.push(`/trips/${trip.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Trips */}
        {completedTrips.length > 0 && (
          <section>
            <h2 className="font-semibold text-neutral-700 mb-3">Past Trips</h2>
            <div className="space-y-3">
              {completedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => router.push(`/trips/${trip.id}`)} isPast />
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}

// Trip Card Component
function TripCard({ trip, onClick, isPast }: { trip: Trip; onClick: () => void; isPast?: boolean }) {
  const daysToGo = Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const packingProgress = trip.packing_list?.length 
    ? Math.round((trip.packing_list.filter((i: any) => i.checked).length / trip.packing_list.length) * 100)
    : 0;
  const image = trip.trip_preferences?.destination_image || getDestinationImage(trip.destination);

  return (
    <Card 
      variant="elevated" 
      padding="none" 
      interactive 
      onClick={onClick}
      className={cn('overflow-hidden', isPast && 'opacity-70')}
    >
      <div className="flex">
        {/* Image */}
        <div className="w-28 h-28 flex-shrink-0 relative">
          <img src={image} alt={trip.destination} className="w-full h-full object-cover" />
          {!isPast && daysToGo >= 0 && daysToGo <= 30 && (
            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur px-2 py-1 rounded-lg">
              <p className="text-xs font-bold text-neutral-900">{daysToGo}d</p>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-neutral-900">{trip.destination}</h3>
            <div className="flex items-center gap-1 text-sm text-neutral-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' - '}
                {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          
          {!isPast && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 flex-1">
                <Progress value={packingProgress} size="sm" className="flex-1 max-w-24" />
                <span className="text-xs text-neutral-500">{packingProgress}%</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
