'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();

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

    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });

    if (data) setTrips(data);
    setLoading(false);
  };

  const handleTripClick = useCallback((tripId: string) => {
    startTransition(() => {
      router.push(`/trips/${tripId}`);
    });
  }, [router]);

  const handleNewTrip = useCallback(() => {
    startTransition(() => {
      router.push('/');
    });
  }, [router]);

  const handleLogin = useCallback(() => {
    startTransition(() => {
      router.push('/login');
    });
  }, [router]);

  const getTripStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  };

  // Not Logged In
  if (!loading && !isLoggedIn) {
    return (
      <Screen className="pb-24">
        <header className="px-5 pt-safe-top">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-text-primary">Your Trips</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-20">
          <div className="w-20 h-20 rounded-3xl bg-dark-elevated flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-text-tertiary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Sign in to see your trips</h2>
          <p className="text-text-secondary text-center mb-8">Save trips and access them from anywhere</p>
          <Button size="lg" onClick={handleLogin}>Sign In</Button>
        </div>

        <BottomNav />
      </Screen>
    );
  }

  // Loading
  if (loading) {
    return (
      <Screen className="flex items-center justify-center pb-24">
        <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <BottomNav />
      </Screen>
    );
  }

  // Empty
  if (trips.length === 0) {
    return (
      <Screen className="pb-24">
        <header className="px-5 pt-safe-top">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-text-primary">Your Trips</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-20">
          <div className="w-20 h-20 rounded-3xl bg-primary-400/20 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No trips yet</h2>
          <p className="text-text-secondary text-center mb-8">Plan your first adventure with AI</p>
          <Button size="lg" onClick={handleNewTrip} icon={<Plus className="w-5 h-5" />}>
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
      <header className="px-5 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-text-primary">Your Trips</h1>
          <Button size="sm" onClick={handleNewTrip} icon={<Plus className="w-4 h-4" />}>
            New
          </Button>
        </div>
      </header>

      <div className={cn('px-5 pb-8 space-y-6', isPending && 'opacity-70')}>
        {/* Ongoing */}
        {ongoingTrips.length > 0 && (
          <section>
            <Badge variant="success" className="mb-3">Active Now</Badge>
            <div className="space-y-3">
              {ongoingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => handleTripClick(trip.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingTrips.length > 0 && (
          <section>
            <h2 className="font-semibold text-text-secondary mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => handleTripClick(trip.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedTrips.length > 0 && (
          <section>
            <h2 className="font-semibold text-text-secondary mb-3">Past Trips</h2>
            <div className="space-y-3">
              {completedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => handleTripClick(trip.id)} isPast />
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}

// Trip Card - optimized
function TripCard({ trip, onClick, isPast }: { trip: Trip; onClick: () => void; isPast?: boolean }) {
  const daysToGo = Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const packingProgress = trip.packing_list?.length
    ? Math.round((trip.packing_list.filter((i: any) => i.checked).length / trip.packing_list.length) * 100)
    : 0;
  const image = trip.trip_preferences?.destination_image || getDestinationImage(trip.destination);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl overflow-hidden border border-border-subtle bg-dark-secondary',
        'active:scale-[0.98] transition-transform duration-100',
        'hover:border-border-default',
        isPast && 'opacity-60'
      )}
    >
      <div className="flex">
        <div className="w-24 h-24 flex-shrink-0 relative">
          <img src={image} alt={trip.destination} className="w-full h-full object-cover" loading="lazy" />
          {!isPast && daysToGo >= 0 && daysToGo <= 30 && (
            <div className="absolute top-2 left-2 bg-dark-primary/90 backdrop-blur px-2 py-0.5 rounded-lg">
              <p className="text-xs font-bold text-text-primary">{daysToGo}d</p>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-bold text-text-primary truncate">{trip.destination}</h3>
            <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' - '}
                {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {!isPast && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Progress value={packingProgress} size="sm" className="flex-1 max-w-20" />
                <span className="text-xs text-text-tertiary flex-shrink-0">{packingProgress}%</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0 ml-2" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
