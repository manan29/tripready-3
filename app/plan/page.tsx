'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Users, Plus, Minus, Heart, ChevronRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/design-system/cn';

const CITIES = [
  { id: 'Mumbai', label: 'Mumbai', emoji: '🌊' },
  { id: 'Delhi', label: 'Delhi', emoji: '🏛️' },
  { id: 'Bangalore', label: 'Bangalore', emoji: '💻' },
  { id: 'Chennai', label: 'Chennai', emoji: '🛕' },
  { id: 'Hyderabad', label: 'Hyderabad', emoji: '🍗' },
  { id: 'Kolkata', label: 'Kolkata', emoji: '🎭' },
];

export default function PlanPage() {
  const router = useRouter();
  
  const [destination, setDestination] = useState('');
  const [fromCity, setFromCity] = useState('Mumbai');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [kids, setKids] = useState(1);
  const [kidAges, setKidAges] = useState<number[]>([5]);
  const [healthConditions, setHealthConditions] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set default date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setStartDate(defaultDate.toISOString().split('T')[0]);
    
    // Get destination from session
    const stored = sessionStorage.getItem('tripPlan');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.destination) setDestination(data.destination);
      else if (data.freeform_query) {
        const match = data.freeform_query.match(/to\s+(\w+)/i);
        if (match) setDestination(match[1]);
        else setDestination(data.freeform_query.replace(/[^\w\s]/g, '').trim());
      }
    }
    setIsLoading(false);
  }, []);

  const updateKidsCount = (newCount: number) => {
    if (newCount < 0 || newCount > 4) return;
    setKids(newCount);
    if (newCount > kidAges.length) {
      setKidAges([...kidAges, ...Array(newCount - kidAges.length).fill(5)]);
    } else {
      setKidAges(kidAges.slice(0, newCount));
    }
  };

  const updateKidAge = (index: number, age: number) => {
    const updated = [...kidAges];
    updated[index] = age;
    setKidAges(updated);
  };

  const handleContinue = () => {
    sessionStorage.setItem('tripPlan', JSON.stringify({
      destination,
      from_city: fromCity,
      start_date: startDate,
      duration,
      adults: 2,
      kids,
      kid_ages: kidAges,
      health_conditions: healthConditions,
    }));
    router.push('/plan/preferences');
  };

  const isValid = destination && startDate && duration > 0;

  if (isLoading) {
    return (
      <Screen className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </Screen>
    );
  }

  return (
    <Screen className="pb-32">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="flex items-center gap-4 py-4">
          <button 
            onClick={() => router.push('/')} 
            className="w-11 h-11 rounded-2xl bg-dark-elevated flex items-center justify-center hover:bg-dark-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">Plan Your Trip</h1>
            <p className="text-sm text-text-tertiary">to {destination || 'your destination'}</p>
          </div>
          <Badge variant="primary">Step 1/2</Badge>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* From City */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-400/20 flex items-center justify-center border border-primary-400/30">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Flying from</h3>
              <p className="text-sm text-text-tertiary">Select your departure city</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => setFromCity(city.id)}
                className={cn(
                  'py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200',
                  fromCity === city.id
                    ? 'bg-primary-400 text-dark-primary shadow-glow-sm'
                    : 'bg-dark-secondary text-text-secondary hover:bg-dark-tertiary border border-border-default'
                )}
              >
                <span className="text-lg block mb-0.5">{city.emoji}</span>
                {city.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Dates */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">When</h3>
              <p className="text-sm text-text-tertiary">Travel dates</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-dark-secondary rounded-xl border-2 border-border-default focus:border-primary-400 focus:bg-dark-tertiary outline-none transition-all text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5">Duration</label>
              <div className="flex items-center justify-between bg-dark-secondary rounded-xl px-3 py-2 border border-border-default">
                <button
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  className="w-9 h-9 rounded-lg bg-dark-elevated shadow-dark-sm flex items-center justify-center hover:bg-dark-tertiary transition-colors"
                >
                  <Minus className="w-4 h-4 text-text-secondary" />
                </button>
                <span className="font-bold text-text-primary">{duration} days</span>
                <button
                  onClick={() => setDuration(duration + 1)}
                  className="w-9 h-9 rounded-lg bg-dark-elevated shadow-dark-sm flex items-center justify-center hover:bg-dark-tertiary transition-colors"
                >
                  <Plus className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Kids */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Traveling with kids?</h3>
              <p className="text-sm text-text-tertiary">2 adults + kids</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
            <span className="font-medium text-text-secondary">Number of kids</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateKidsCount(kids - 1)}
                className="w-9 h-9 rounded-lg bg-dark-elevated flex items-center justify-center hover:bg-dark-tertiary transition-colors"
              >
                <Minus className="w-4 h-4 text-text-secondary" />
              </button>
              <span className="w-8 text-center font-bold text-lg text-text-primary">{kids}</span>
              <button
                onClick={() => updateKidsCount(kids + 1)}
                className="w-9 h-9 rounded-lg bg-dark-elevated flex items-center justify-center hover:bg-dark-tertiary transition-colors"
              >
                <Plus className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>

          {kids > 0 && (
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-2">Ages</label>
              <div className="flex flex-wrap gap-2">
                {kidAges.map((age, index) => (
                  <select
                    key={index}
                    value={age}
                    onChange={(e) => updateKidAge(index, parseInt(e.target.value))}
                    className="px-4 py-2.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl text-amber-400 font-medium outline-none focus:border-amber-400 transition-colors"
                  >
                    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(a => (
                      <option key={a} value={a}>{a} year{a !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Health Conditions */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Health considerations</h3>
              <p className="text-sm text-text-tertiary">Optional but helpful</p>
            </div>
          </div>
          
          <input
            type="text"
            value={healthConditions}
            onChange={(e) => setHealthConditions(e.target.value)}
            placeholder="E.g., dust allergy, asthma, lactose intolerant..."
            className="w-full px-4 py-3 bg-dark-secondary rounded-xl border-2 border-border-default focus:border-primary-400 focus:bg-dark-tertiary outline-none transition-all placeholder-text-tertiary text-text-primary"
          />
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-dark-secondary/95 backdrop-blur-xl border-t border-border-default">
        <Button
          size="xl"
          fullWidth
          onClick={handleContinue}
          disabled={!isValid}
          icon={<ChevronRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Continue to Preferences
        </Button>
      </div>
    </Screen>
  );
}
