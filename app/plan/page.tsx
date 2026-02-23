'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Sparkles, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface KidDetail {
  id: string;
  age: number;
  name: string;
  health_notes: string;
}

export default function PlanTripPage() {
  const router = useRouter();
  const supabase = createClient();

  const [freeformQuery, setFreeformQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(1);
  const [kidDetails, setKidDetails] = useState<KidDetail[]>([
    { id: '1', age: 5, name: '', health_notes: '' }
  ]);
  const [rememberPrefs, setRememberPrefs] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Set default date 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setStartDate(defaultDate.toISOString().split('T')[0]);

    // Check auth
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);

    if (user) {
      loadUserProfile();
    }
  };

  const loadUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();

      if (data.profile?.family_members?.length > 0) {
        const savedKids = data.profile.family_members.filter((m: any) => m.relation === 'child');
        if (savedKids.length > 0) {
          setKids(savedKids.length);
          setKidDetails(savedKids.map((k: any, i: number) => ({
            id: String(i + 1),
            age: k.age || 5,
            name: k.name || '',
            health_notes: k.health_notes || ''
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const updateKidsCount = (newCount: number) => {
    if (newCount < 0) return;
    if (newCount > 4) return;

    setKids(newCount);

    if (newCount > kidDetails.length) {
      const newKids = [...kidDetails];
      for (let i = kidDetails.length; i < newCount; i++) {
        newKids.push({ id: String(i + 1), age: 5, name: '', health_notes: '' });
      }
      setKidDetails(newKids);
    } else {
      setKidDetails(kidDetails.slice(0, newCount));
    }
  };

  const updateKidDetail = (id: string, field: keyof KidDetail, value: any) => {
    setKidDetails(prev => prev.map(k =>
      k.id === id ? { ...k, [field]: value } : k
    ));
  };

  const handleContinue = () => {
    // Store in sessionStorage for next screen
    sessionStorage.setItem('tripPlan', JSON.stringify({
      freeform_query: freeformQuery,
      start_date: startDate,
      duration,
      adults,
      kids,
      kid_details: kidDetails,
      remember_prefs: rememberPrefs
    }));

    router.push('/plan/preferences');
  };

  const isValid = startDate && duration > 0 && adults > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Plan Your Trip</h1>
          <p className="text-sm text-[#6B6B6B]">Step 1 of 2</p>
        </div>
      </header>

      <div className="px-5 py-4 space-y-6 pb-32">
        {/* Freeform Query */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            <Sparkles className="w-4 h-4 inline mr-1 text-[#0A7A6E]" />
            Tell us about your trip
          </label>
          <textarea
            value={freeformQuery}
            onChange={(e) => setFreeformQuery(e.target.value)}
            placeholder="E.g., Planning a beach trip with my 5 year old who has dust allergies. Looking for somewhere clean and relaxing..."
            className="w-full px-4 py-4 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:border-[#0A7A6E] min-h-[100px] resize-none"
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">📅 When</label>
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

        {/* Travelers */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">👨‍👩‍👧 Who's traveling</label>

          {/* Adults */}
          <div className="flex items-center justify-between bg-[#F8F7F5] rounded-xl p-4 mb-3">
            <span className="font-medium text-[#1A1A1A]">Adults</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#E5E5E5]">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold">{adults}</span>
              <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#E5E5E5]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Kids */}
          <div className="flex items-center justify-between bg-[#F8F7F5] rounded-xl p-4">
            <span className="font-medium text-[#1A1A1A]">Kids</span>
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
        </div>

        {/* Kid Details */}
        {kids > 0 && (
          <div className="space-y-4">
            {kidDetails.map((kid, index) => (
              <div key={kid.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">👶</span>
                  <span className="font-medium text-[#1A1A1A]">Child {index + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-[#6B6B6B] mb-1 block">Name (optional)</label>
                    <input
                      type="text"
                      value={kid.name}
                      onChange={(e) => updateKidDetail(kid.id, 'name', e.target.value)}
                      placeholder="E.g., Aarav"
                      className="w-full px-3 py-2 bg-[#F8F7F5] rounded-lg border border-[#E5E5E5] text-sm outline-none focus:border-[#0A7A6E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] mb-1 block">Age</label>
                    <select
                      value={kid.age}
                      onChange={(e) => updateKidDetail(kid.id, 'age', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F8F7F5] rounded-lg border border-[#E5E5E5] text-sm outline-none focus:border-[#0A7A6E]"
                    >
                      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(age => (
                        <option key={age} value={age}>{age} {age === 1 ? 'year' : 'years'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#6B6B6B] mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Health notes (allergies, conditions)
                  </label>
                  <input
                    type="text"
                    value={kid.health_notes}
                    onChange={(e) => updateKidDetail(kid.id, 'health_notes', e.target.value)}
                    placeholder="E.g., Dust allergy, needs AC rooms"
                    className="w-full px-3 py-2 bg-[#F8F7F5] rounded-lg border border-[#E5E5E5] text-sm outline-none focus:border-[#0A7A6E]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remember Preferences */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberPrefs}
            onChange={(e) => setRememberPrefs(e.target.checked)}
            className="w-5 h-5 rounded border-[#E5E5E5] text-[#0A7A6E] focus:ring-[#0A7A6E]"
          />
          <span className="text-sm text-[#6B6B6B]">Remember for future trips</span>
        </label>
      </div>

      {/* Fixed Bottom Button */}
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
