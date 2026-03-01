'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Sparkles, MapPin } from 'lucide-react';

const CITIES = [
  { id: 'Mumbai', label: 'Mumbai' },
  { id: 'Delhi', label: 'Delhi' },
  { id: 'Bangalore', label: 'Bangalore' },
  { id: 'Chennai', label: 'Chennai' },
  { id: 'Hyderabad', label: 'Hyderabad' },
  { id: 'Kolkata', label: 'Kolkata' },
];

export default function PlanTripPage() {
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
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setStartDate(defaultDate.toISOString().split('T')[0]);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#0A7A6E] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-5 pt-12 pb-4 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Plan your trip to {destination}</h1>
          <p className="text-sm text-[#6B6B6B]">Step 1 of 2</p>
        </div>
      </header>

      <div className="px-5 py-4 space-y-6 pb-32">
        {/* Departure City */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
            <MapPin className="w-4 h-4 inline mr-1" />
            Flying from
          </label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => setFromCity(city.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  fromCity === city.id
                    ? 'bg-[#0A7A6E] text-white'
                    : 'bg-[#F8F7F5] text-[#1A1A1A] border border-[#E5E5E5]'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* When */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">📅 When are you traveling?</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] outline-none focus:border-[#0A7A6E]"
              />
              <p className="text-xs text-[#6B6B6B] mt-1">Start date</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] px-4 py-3">
                <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-8 h-8 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-[#6B6B6B]" />
                </button>
                <span className="font-semibold text-[#1A1A1A]">{duration} days</span>
                <button onClick={() => setDuration(duration + 1)} className="w-8 h-8 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-[#6B6B6B]" />
                </button>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1">Duration</p>
            </div>
          </div>
        </div>

        {/* Kids */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">👶 Traveling with kids?</label>
          <div className="bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-[#1A1A1A]">Number of kids</span>
              <div className="flex items-center gap-4">
                <button onClick={() => updateKidsCount(kids - 1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#E5E5E5]">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold">{kids}</span>
                <button onClick={() => updateKidsCount(kids + 1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#E5E5E5]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {kids > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-[#6B6B6B]">Ages:</span>
                {kidAges.map((age, index) => (
                  <select
                    key={index}
                    value={age}
                    onChange={(e) => updateKidAge(index, parseInt(e.target.value))}
                    className="px-3 py-2 bg-white rounded-lg border border-[#E5E5E5] text-sm outline-none focus:border-[#0A7A6E]"
                  >
                    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(a => (
                      <option key={a} value={a}>{a} yr</option>
                    ))}
                  </select>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Health Conditions */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            ⚕️ Any health conditions? <span className="text-[#9CA3AF]">(optional)</span>
          </label>
          <input
            type="text"
            value={healthConditions}
            onChange={(e) => setHealthConditions(e.target.value)}
            placeholder="E.g., dust allergy, asthma, lactose intolerant..."
            className="w-full px-4 py-3 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] outline-none focus:border-[#0A7A6E] text-sm"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F0F0F0]">
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-semibold ${isValid ? 'bg-[#0A7A6E] text-white' : 'bg-[#E5E5E5] text-[#9CA3AF]'}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
