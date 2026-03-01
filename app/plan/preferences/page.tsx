'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plane, Building2, Sparkles, Check } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/design-system/cn';

const AIRLINES = [
  { id: 'any', label: 'No Preference', emoji: '✈️' },
  { id: 'Emirates', label: 'Emirates', emoji: '🇦🇪' },
  { id: 'IndiGo', label: 'IndiGo', emoji: '🔵' },
  { id: 'Air India', label: 'Air India', emoji: '🇮🇳' },
  { id: 'Vistara', label: 'Vistara', emoji: '⭐' },
];

const HOTEL_RATINGS = [
  { id: 3, label: '3 Star', desc: 'Budget friendly' },
  { id: 4, label: '4 Star', desc: 'Best value' },
  { id: 5, label: '5 Star', desc: 'Luxury' },
  { id: 0, label: 'Any', desc: 'Show all' },
];

const AMENITIES = [
  { id: 'metro', label: 'Near Metro', emoji: '🚇' },
  { id: 'central', label: 'Central Location', emoji: '🏙️' },
  { id: 'indian_food', label: 'Indian Food Nearby', emoji: '🍛' },
  { id: 'pool', label: 'Pool', emoji: '🏊' },
  { id: 'kids_friendly', label: 'Kids Friendly', emoji: '👶' },
  { id: 'beach', label: 'Beach Access', emoji: '🏖️' },
];

export default function PreferencesPage() {
  const router = useRouter();
  
  const [airline, setAirline] = useState('any');
  const [hotelRating, setHotelRating] = useState(4);
  const [amenities, setAmenities] = useState<string[]>(['central', 'indian_food']);
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('tripPlan');
    if (!stored) {
      router.push('/plan');
      return;
    }
    setTripData(JSON.parse(stored));
  }, []);

  const toggleAmenity = (id: string) => {
    setAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    const updated = {
      ...tripData,
      airline: airline === 'any' ? null : airline,
      hotel_rating: hotelRating === 0 ? null : hotelRating,
      amenities,
    };
    sessionStorage.setItem('tripPlan', JSON.stringify(updated));
    router.push('/plan/magic');
  };

  return (
    <Screen className="pb-32">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="flex items-center gap-4 py-4">
          <button 
            onClick={() => router.back()} 
            className="w-11 h-11 rounded-2xl bg-dark-elevated flex items-center justify-center hover:bg-dark-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">Your Preferences</h1>
            <p className="text-sm text-text-tertiary">Help us personalize</p>
          </div>
          <Badge variant="primary">Step 2/2</Badge>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Airline Preference */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
              <Plane className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Airline preference</h3>
              <p className="text-sm text-text-tertiary">For flight recommendations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {AIRLINES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAirline(a.id)}
                className={cn(
                  'flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200',
                  airline === a.id
                    ? 'bg-sky-500 text-white shadow-glow-sm'
                    : 'bg-dark-secondary text-text-secondary hover:bg-dark-tertiary border border-border-default'
                )}
              >
                <span>{a.emoji}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Hotel Rating */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Building2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Hotel rating</h3>
              <p className="text-sm text-text-tertiary">Minimum star rating</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {HOTEL_RATINGS.map((r) => (
              <button
                key={r.id}
                onClick={() => setHotelRating(r.id)}
                className={cn(
                  'py-3 px-2 rounded-xl text-center transition-all duration-200',
                  hotelRating === r.id
                    ? 'bg-violet-500 text-white shadow-glow-sm'
                    : 'bg-dark-secondary text-text-secondary hover:bg-dark-tertiary border border-border-default'
                )}
              >
                <p className="font-bold text-sm">{r.label}</p>
                <p className={cn(
                  'text-[10px] mt-0.5',
                  hotelRating === r.id ? 'text-violet-100' : 'text-text-tertiary'
                )}>{r.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Amenities */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Must-have amenities</h3>
              <p className="text-sm text-text-tertiary">Select all that apply</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map((a) => {
              const selected = amenities.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={cn(
                    'flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 relative',
                    selected
                      ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500'
                      : 'bg-dark-secondary text-text-secondary hover:bg-dark-tertiary border border-border-default'
                  )}
                >
                  <span>{a.emoji}</span>
                  <span className="flex-1 text-left">{a.label}</span>
                  {selected && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-dark-secondary/95 backdrop-blur-xl border-t border-border-default">
        <Button
          size="xl"
          fullWidth
          onClick={handleContinue}
          icon={<Sparkles className="w-5 h-5" />}
        >
          Generate My Trip Plan
        </Button>
        <button 
          onClick={handleContinue}
          className="w-full mt-3 text-center text-sm text-text-tertiary font-medium hover:text-text-secondary transition-colors"
        >
          Skip preferences
        </button>
      </div>
    </Screen>
  );
}
