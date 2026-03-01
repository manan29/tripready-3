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
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
            className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-neutral-900">Plan Your Trip</h1>
            <p className="text-sm text-neutral-500">to {destination || 'your destination'}</p>
          </div>
          <Badge variant="primary">Step 1/2</Badge>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* From City */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Flying from</h3>
              <p className="text-sm text-neutral-500">Select your departure city</p>
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
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
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
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">When</h3>
              <p className="text-sm text-neutral-500">Travel dates</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Duration</label>
              <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
                <button
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <Minus className="w-4 h-4 text-neutral-600" />
                </button>
                <span className="font-bold text-neutral-900">{duration} days</span>
                <button
                  onClick={() => setDuration(duration + 1)}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Kids */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Traveling with kids?</h3>
              <p className="text-sm text-neutral-500">2 adults + kids</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
            <span className="font-medium text-neutral-700">Number of kids</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateKidsCount(kids - 1)}
                className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <Minus className="w-4 h-4 text-neutral-600" />
              </button>
              <span className="w-8 text-center font-bold text-lg text-neutral-900">{kids}</span>
              <button
                onClick={() => updateKidsCount(kids + 1)}
                className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </div>

          {kids > 0 && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">Ages</label>
              <div className="flex flex-wrap gap-2">
                {kidAges.map((age, index) => (
                  <select
                    key={index}
                    value={age}
                    onChange={(e) => updateKidAge(index, parseInt(e.target.value))}
                    className="px-4 py-2.5 bg-amber-50 border-2 border-amber-100 rounded-xl text-amber-900 font-medium outline-none focus:border-amber-300 transition-colors"
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
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Health considerations</h3>
              <p className="text-sm text-neutral-500">Optional but helpful</p>
            </div>
          </div>
          
          <input
            type="text"
            value={healthConditions}
            onChange={(e) => setHealthConditions(e.target.value)}
            placeholder="E.g., dust allergy, asthma, lactose intolerant..."
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all placeholder-neutral-400"
          />
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-xl border-t border-neutral-100">
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
