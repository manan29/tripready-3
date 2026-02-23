'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Loader2, ArrowLeft, Plane, Hotel, AlertCircle } from 'lucide-react';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';

const LOADING_STEPS = [
  'Understanding your needs',
  'Checking health-friendly destinations',
  'Finding best matches',
  'Comparing hotels with pools',
  'Finding morning flights',
  'Building personalized packing list',
  'Creating health-specific tips',
];

export default function MagicPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'loading' | 'results' | 'signup'>('loading');
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [tripPlan, setTripPlan] = useState<any>(null);
  const [tripData, setTripData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [funFact, setFunFact] = useState('');

  const funFacts = [
    'Maldives has some of the cleanest air in the world!',
    'Emirates A380 has hospital-grade air filtration.',
    'Morning flights work best with kids - they sleep through!',
    'Most 4-star resorts offer HEPA air purifiers on request.',
  ];

  useEffect(() => {
    const stored = sessionStorage.getItem('tripPlan');
    if (!stored) {
      router.push('/plan');
      return;
    }

    setTripData(JSON.parse(stored));
    setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    checkAuth();
    generatePlan(JSON.parse(stored));
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const generatePlan = async (data: any) => {
    const stepInterval = setInterval(() => {
      setCurrentLoadingStep(prev => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    try {
      const response = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeform_query: data.freeform_query,
          start_date: data.start_date,
          duration: data.duration,
          adults: data.adults,
          kids: data.kids,
          kid_details: data.kid_details,
          health_notes: data.kid_details?.map((k: any) => k.health_notes).filter(Boolean).join(', '),
          hotel_rating: data.hotel_rating,
          amenities: data.amenities,
          airlines: data.airlines,
          destination: data.destination,
          suggest_destination: data.suggest_destination
        }),
      });

      const result = await response.json();

      clearInterval(stepInterval);
      setCurrentLoadingStep(LOADING_STEPS.length);

      setTimeout(() => {
        setTripPlan(result.fallback || result);
        setStep('results');
      }, 500);

    } catch (error) {
      console.error('Failed to generate plan:', error);
      clearInterval(stepInterval);
      setTripPlan(getFallbackPlan());
      setStep('results');
    }
  };

  const getFallbackPlan = () => ({
    selected_destination: { name: 'Maldives', country: 'Maldives', why_chosen: 'Clean air, family-friendly beaches' },
    flight_recommendation: { airline: 'Emirates', flight_number: 'EK501', departure_time: '07:30', arrival_time: '10:45', price_per_person: 42000, total_price: 126000, why_recommended: 'A380 with better air quality' },
    hotel_recommendation: { name: 'Soneva Fushi', rating: 5, price_per_night: 85000, total_price: 595000, amenities: ['Pool', 'Beach', 'Kids Club'], why_recommended: 'HEPA filtered rooms available', health_features: 'Air purification systems' },
    health_specific_tips: ['Request HEPA filter room', 'Pack portable air purifier', 'Carry antihistamines', 'Saline nasal spray for flights'],
    packing_list: {
      priority_items: [
        { item: 'Portable air purifier', reason: 'For dust allergy', category: 'medical' },
        { item: 'Antihistamines', reason: 'Allergy relief', category: 'medical' },
        { item: 'Saline nasal spray', reason: 'Post-flight relief', category: 'medical' },
      ],
      kids_items: [
        { item: 'Swim floaties', for_age: 5, category: 'swim' },
        { item: 'Reef-safe sunscreen SPF 50', for_age: 5, category: 'essentials' },
        { item: 'Light cotton clothes', for_age: 5, category: 'clothing' },
      ],
      adult_items: [
        { item: 'Passport & copies', category: 'documents' },
        { item: 'Phone charger', category: 'electronics' },
        { item: 'Sunscreen', category: 'essentials' },
      ]
    },
    estimated_budget: { flights: 126000, hotel: 595000, food_estimate: 50000, activities_estimate: 30000, total: 801000, currency: 'INR' },
    destination_info: { weather: '29°C Sunny', currency: 'MVR', currency_rate: 0.18, time_difference: '+30 min', visa_info: 'Visa on arrival, free for 30 days' }
  });

  const handleSaveTrip = async () => {
    if (!isLoggedIn) {
      localStorage.setItem('pendingTrip', JSON.stringify({ tripData, tripPlan }));
      setStep('signup');
      return;
    }
    await saveTrip();
  };

  const saveTrip = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStep('signup');
        return;
      }

      if (tripData.remember_prefs) {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            family_members: tripData.kid_details?.map((k: any) => ({
              name: k.name,
              age: k.age,
              relation: 'child',
              health_notes: k.health_notes
            })) || [],
            preferred_airlines: tripData.airlines || [],
            preferred_hotel_rating: tripData.hotel_rating || 4,
            preferred_amenities: tripData.amenities || [],
          }),
        });
      }

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

      sessionStorage.removeItem('tripPlan');
      router.push(`/trips/${data.id}`);

    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save trip. Please try again.');
    }

    setSaving(false);
  };

  const handleLoginRedirect = () => {
    localStorage.setItem('pendingTrip', JSON.stringify({ tripData, tripPlan }));
    router.push('/login?redirect=/plan/save');
  };

  // Loading State
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5">
        <Sparkles className="w-16 h-16 text-[#0A7A6E] animate-pulse mb-6" />
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Planning your perfect trip...</h2>
        <p className="text-[#6B6B6B] mb-8">This usually takes 10-15 seconds</p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {LOADING_STEPS.map((loadingStep, index) => (
            <div key={index} className="flex items-center gap-3">
              {index < currentLoadingStep ? (
                <div className="w-6 h-6 bg-[#0A7A6E] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : index === currentLoadingStep ? (
                <Loader2 className="w-6 h-6 text-[#0A7A6E] animate-spin" />
              ) : (
                <div className="w-6 h-6 border-2 border-[#E5E5E5] rounded-full" />
              )}
              <span className={index <= currentLoadingStep ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}>
                {loadingStep}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#F0FDFA] rounded-xl p-4 max-w-sm">
          <p className="text-sm text-[#0A7A6E]">💡 {funFact}</p>
        </div>
      </div>
    );
  }

  // Signup Prompt
  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-5 pt-12 pb-4">
          <button onClick={() => setStep('results')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-20 h-20 bg-[#F0FDFA] rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-[#0A7A6E]" />
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 text-center">Save Your Trip</h2>
          <p className="text-[#6B6B6B] text-center mb-6">Sign up to unlock:</p>

          <div className="w-full max-w-sm bg-[#F8F7F5] rounded-2xl p-4 mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#0A7A6E]" />
              <span className="text-[#1A1A1A]">Full packing list ({(tripPlan?.packing_list?.kids_items?.length || 0) + (tripPlan?.packing_list?.adult_items?.length || 0) + (tripPlan?.packing_list?.priority_items?.length || 0)} items)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#0A7A6E]" />
              <span className="text-[#1A1A1A]">Health-specific reminders</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#0A7A6E]" />
              <span className="text-[#1A1A1A]">Price tracking & alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#0A7A6E]" />
              <span className="text-[#1A1A1A]">WhatsApp trip updates</span>
            </div>
          </div>

          <button onClick={handleLoginRedirect} className="w-full max-w-sm bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold mb-4">
            Sign Up / Login
          </button>

          <button onClick={() => router.push('/')} className="text-[#6B6B6B] font-medium">
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  // Results State
  if (!tripPlan) return null;

  const destination = tripPlan.selected_destination?.name || 'Maldives';
  const flight = tripPlan.flight_recommendation || {};
  const hotel = tripPlan.hotel_recommendation || {};
  const budget = tripPlan.estimated_budget || {};
  const healthTips = tripPlan.health_specific_tips || [];
  const packingPriority = tripPlan.packing_list?.priority_items || [];
  const packingKids = tripPlan.packing_list?.kids_items || [];
  const packingAdults = tripPlan.packing_list?.adult_items || [];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero */}
      <div className="relative h-64">
        <img src={getDestinationImage(destination)} alt={destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={() => router.push('/plan/preferences')} className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <span className="bg-[#0A7A6E] text-white text-xs px-2 py-1 rounded-full">Recommended</span>
          <h1 className="text-white font-bold text-3xl mt-1">{destination}</h1>
          <p className="text-white/80">
            {tripData?.start_date && new Date(tripData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tripData?.duration} days
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Why Perfect */}
        <div className="bg-[#F0FDFA] rounded-2xl p-4">
          <h3 className="font-semibold text-[#0A7A6E] mb-2">Why this is perfect for your family:</h3>
          <ul className="space-y-2 text-sm text-[#1A1A1A]">
            {tripPlan.selected_destination?.why_chosen && (
              <li className="flex items-start gap-2"><span>🌬️</span><span>{tripPlan.selected_destination.why_chosen}</span></li>
            )}
            {hotel.health_features && (
              <li className="flex items-start gap-2"><span>🏨</span><span>{hotel.health_features}</span></li>
            )}
            {flight.why_recommended && (
              <li className="flex items-start gap-2"><span>✈️</span><span>{flight.why_recommended}</span></li>
            )}
          </ul>
        </div>

        {/* Flight & Hotel */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-[#0A7A6E]" />
              <span className="text-sm font-medium text-[#6B6B6B]">Flight</span>
            </div>
            <p className="font-semibold text-[#1A1A1A]">{flight.airline || 'Emirates'}</p>
            <p className="text-sm text-[#6B6B6B]">{flight.departure_time || '07:30'} departure</p>
            <p className="text-[#0A7A6E] font-semibold mt-2">₹{(flight.price_per_person || 42000).toLocaleString()}/person</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hotel className="w-4 h-4 text-[#0A7A6E]" />
              <span className="text-sm font-medium text-[#6B6B6B]">Stay</span>
            </div>
            <p className="font-semibold text-[#1A1A1A]">{hotel.name || 'Resort'}</p>
            <p className="text-sm text-[#6B6B6B]">{hotel.rating || 4}⭐</p>
            <p className="text-[#0A7A6E] font-semibold mt-2">₹{(hotel.price_per_night || 25000).toLocaleString()}/night</p>
          </div>
        </div>

        {/* Health Tips */}
        {healthTips.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-[#0A7A6E]" />
              <h3 className="font-semibold text-[#1A1A1A]">Health Tips</h3>
            </div>
            <ul className="space-y-2">
              {healthTips.slice(0, 3).map((tip: string, i: number) => (
                <li key={i} className="text-sm text-[#6B6B6B] flex items-start gap-2">
                  <span>•</span><span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Packing Preview */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#1A1A1A]">📋 Packing List</h3>
            <span className="text-sm text-[#6B6B6B]">{packingPriority.length + packingKids.length + packingAdults.length} items</span>
          </div>

          {packingPriority.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-600 mb-2">⚠️ Priority (Health)</p>
              {packingPriority.slice(0, 3).map((item: any, i: number) => (
                <p key={i} className="text-sm text-[#1A1A1A]">• {item.item}</p>
              ))}
            </div>
          )}

          {packingKids.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-[#6B6B6B] mb-2">👶 For Kids</p>
              {packingKids.slice(0, 3).map((item: any, i: number) => (
                <p key={i} className="text-sm text-[#1A1A1A]">• {item.item}</p>
              ))}
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="bg-[#F8F7F5] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#6B6B6B]">Estimated Total</span>
            <span className="text-2xl font-bold text-[#1A1A1A]">₹{(budget.total || 300000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F0F0F0] space-y-3">
        <button onClick={handleSaveTrip} disabled={saving} className="w-full py-4 rounded-xl font-semibold bg-[#0A7A6E] text-white flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Sparkles className="w-5 h-5" /> {isLoggedIn ? 'Save Trip' : 'Save Trip & Get Full Details'}</>}
        </button>
        <button onClick={() => router.push('/plan/preferences')} className="w-full py-3 rounded-xl font-medium text-[#6B6B6B]">
          🔄 Show me other options
        </button>
      </div>
    </div>
  );
}
