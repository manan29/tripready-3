'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Loader2, ArrowLeft, Home, TrendingDown, Plane } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const LOADING_STEPS = [
  'Analyzing your trip...',
  'Checking weather...',
  'Finding best flights...',
  'Building packing list...',
];

interface FlightTrend { date: string; price: number; day: string; }

export default function MagicPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'loading' | 'results' | 'signup'>('loading');
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [tripData, setTripData] = useState<any>(null);
  const [tripPlan, setTripPlan] = useState<any>(null);
  const [flightTrends, setFlightTrends] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [destinationImage, setDestinationImage] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('tripPlan');
    if (!stored) { router.push('/'); return; }
    setTripData(JSON.parse(stored));
    checkAuth();
    generatePlan(JSON.parse(stored));
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const goHome = () => {
    sessionStorage.removeItem('tripPlan');
    router.push('/');
  };

  const generatePlan = async (data: any) => {
    const interval = setInterval(() => {
      setCurrentLoadingStep(prev => prev >= LOADING_STEPS.length - 1 ? prev : prev + 1);
    }, 400);

    try {
      const [flightRes, weatherRes, imageRes, aiRes] = await Promise.all([
        fetch(`/api/flights/trends?destination=${encodeURIComponent(data.destination)}&startDate=${data.start_date}&fromCity=${encodeURIComponent(data.from_city || 'Mumbai')}`),
        fetch(`/api/weather?city=${encodeURIComponent(data.destination)}`),
        fetch(`/api/images/destination?destination=${encodeURIComponent(data.destination)}`),
        fetch('/api/ai/plan-trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      ]);

      const [flightData, weatherData, imageData, aiData] = await Promise.all([
        flightRes.json(), weatherRes.json(), imageRes.json(), aiRes.json(),
      ]);

      setFlightTrends(flightData);
      setWeather(weatherData);
      setDestinationImage(imageData.url || '');
      setTripPlan(aiData);
      clearInterval(interval);
      setCurrentLoadingStep(LOADING_STEPS.length);
      setTimeout(() => setStep('results'), 300);
    } catch (error) {
      clearInterval(interval);
      setTripPlan(getFallbackPlan(data));
      setStep('results');
    }
  };

  const getFallbackPlan = (data: any) => ({
    honest_take: { weather_reality: `${data.destination} will be warm.`, kid_friendliness: 5 },
    things_to_know: ['🛂 Check visa requirements', '💱 Carry forex card', '🚕 Uber available'],
    packing_list: {
      kids: ['Light clothes', 'Shoes', 'Swimwear', 'Sun hat', 'Sunscreen', 'Jacket for AC', 'Snacks', 'Toy', 'Tablet', 'Water bottle', 'Medicines', 'Wipes'],
      adults: ['Passport', 'Visa', 'Insurance', 'Forex', 'Adapter', 'Sunglasses', 'Shoes', 'Cardigan', 'Meds'],
      indian_essentials: ['Hing', 'MTR meals', 'Maggi', 'Pickle', 'Chai', 'Namkeen'],
    },
  });

  const handleSaveTrip = async () => {
    if (!isLoggedIn) {
      localStorage.setItem('pendingTrip', JSON.stringify({ tripData, tripPlan, flightTrends, destinationImage }));
      setStep('signup');
      return;
    }
    await saveTrip();
  };

  const saveTrip = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStep('signup'); return; }

      const endDate = new Date(tripData.start_date);
      endDate.setDate(endDate.getDate() + tripData.duration - 1);

      const packingList = [
        ...(tripPlan.packing_list?.kids || []).map((item: string, i: number) => ({ id: `k${i}`, text: item, checked: false, category: 'kids' })),
        ...(tripPlan.packing_list?.adults || []).map((item: string, i: number) => ({ id: `a${i}`, text: item, checked: false, category: 'adults' })),
        ...(tripPlan.packing_list?.indian_essentials || []).map((item: string, i: number) => ({ id: `i${i}`, text: item, checked: false, category: 'indian' })),
      ];

      const { data, error } = await supabase.from('trips').insert({
        user_id: user.id,
        destination: tripData.destination,
        start_date: tripData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        num_adults: 2,
        num_kids: tripData.kids,
        kid_ages: tripData.kid_ages,
        health_notes: tripData.health_conditions || '',
        packing_list: packingList,
        trip_preferences: {
          from_city: tripData.from_city,
          airline: tripData.airline,
          hotel_rating: tripData.hotel_rating,
          amenities: tripData.amenities,
          flight_trends: flightTrends,
          honest_take: tripPlan.honest_take,
          things_to_know: tripPlan.things_to_know,
          destination_image: destinationImage,
        },
      }).select().single();

      if (error) throw error;
      sessionStorage.removeItem('tripPlan');
      router.push(`/trips/${data.id}`);
    } catch (error) {
      alert('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleLoginRedirect = () => {
    localStorage.setItem('pendingTrip', JSON.stringify({ tripData, tripPlan, flightTrends, destinationImage }));
    router.push('/login?redirect=/plan/save');
  };

  // Loading
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] to-white flex flex-col">
        {/* Back to Home */}
        <div className="px-5 pt-12">
          <button onClick={goHome} className="flex items-center gap-2 text-[#6B6B6B]">
            <Home className="w-5 h-5" />
            <span className="text-sm">Start over</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0A7A6E] to-[#0D9488] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#0A7A6E]/30">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Planning your trip...</h2>
          <p className="text-[#6B6B6B] mb-8">This takes just a moment</p>
          <div className="w-full max-w-xs space-y-3">
            {LOADING_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < currentLoadingStep ? (
                  <div className="w-6 h-6 bg-[#0A7A6E] rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
                ) : i === currentLoadingStep ? (
                  <Loader2 className="w-6 h-6 text-[#0A7A6E] animate-spin" />
                ) : (
                  <div className="w-6 h-6 border-2 border-[#E5E5E5] rounded-full" />
                )}
                <span className={`text-sm ${i <= currentLoadingStep ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Signup
  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] to-white flex flex-col">
        <div className="px-5 pt-12">
          <button onClick={() => setStep('results')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0A7A6E] to-[#0D9488] rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Save Your Trip</h2>
          <p className="text-[#6B6B6B] mb-8 text-center">Sign in to access your trip anytime</p>
          <button onClick={handleLoginRedirect} className="w-full max-w-xs bg-[#0A7A6E] text-white py-4 rounded-2xl font-semibold shadow-lg shadow-[#0A7A6E]/30 mb-4">
            Sign Up / Login
          </button>
          <button onClick={goHome} className="text-[#6B6B6B]">Maybe Later</button>
        </div>
      </div>
    );
  }

  // Results
  const destination = tripData?.destination || '';
  const fromCity = tripData?.from_city || 'Mumbai';
  const trends = flightTrends?.trends || [];
  const hasTrends = trends.length > 0;
  const bestFlight = flightTrends?.bestFlight || {};
  const savings = flightTrends?.savings || 0;
  const lowestPrice = flightTrends?.lowestPrice || 0;
  const lowestDate = flightTrends?.lowestDate;
  const thingsToKnow = tripPlan?.things_to_know || [];
  const packingKids = tripPlan?.packing_list?.kids || [];
  const packingAdults = tripPlan?.packing_list?.adults || [];
  const packingIndian = tripPlan?.packing_list?.indian_essentials || [];
  const prices = trends.map((t: FlightTrend) => t.price);
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const minPrice = prices.length ? Math.min(...prices) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-white to-[#F8F7F5] pb-28">
      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={goHome} className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
            <Home className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <span className="text-sm font-medium text-[#6B6B6B]">Trip Preview</span>
          <div className="w-11" />
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-28 pb-4">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[#0A7A6E]/20">
          <img src={destinationImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'} alt={destination} className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-white font-bold text-2xl mb-1">{destination}</h1>
            <p className="text-white/70 text-sm">
              {new Date(tripData?.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tripData?.duration} days • From {fromCity}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Honest Take */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
          <h2 className="font-bold text-[#1A1A1A] mb-3">🌡️ Quick Take</h2>
          <p className="text-sm text-[#6B6B6B]">
            {weather?.current ? `${weather.current.temp}°C - ${weather.current.temp > 32 ? "Hot! Plan indoor time midday." : "Pleasant for sightseeing."}` : tripPlan?.honest_take?.weather_reality}
          </p>
          <p className="text-sm text-[#6B6B6B] mt-2">
            ✈️ Direct flights from {fromCity}: <span className="font-medium text-[#1A1A1A]">{flightTrends?.directFlightsFromCity || 'Multiple'} daily</span>
          </p>
        </div>

        {/* Flight Insight */}
        {hasTrends && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-[#0A7A6E]" />
              <h2 className="font-bold text-[#1A1A1A]">Flight from {fromCity}</h2>
            </div>

            <div className="bg-[#F8F7F5] rounded-2xl p-3 mb-3">
              <div className="h-12 flex items-end gap-0.5">
                {trends.slice(0, 20).map((t: FlightTrend, i: number) => {
                  const h = maxPrice > minPrice ? ((t.price - minPrice) / (maxPrice - minPrice)) * 100 : 50;
                  return <div key={i} className={`flex-1 rounded-t ${t.price === lowestPrice ? 'bg-green-500' : i === 0 ? 'bg-[#0A7A6E]' : 'bg-[#CBD5E1]'}`} style={{ height: `${Math.max(h, 10)}%` }} />;
                })}
              </div>
            </div>

            {savings > 500 && (
              <div className="bg-green-50 rounded-2xl p-3 mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Save ₹{savings.toLocaleString()} on {new Date(lowestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}

            {bestFlight.airline && (
              <div className="border border-[#0A7A6E] rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{bestFlight.airline}</p>
                    <p className="text-xs text-[#6B6B6B]">{bestFlight.departure} → {bestFlight.arrival} • {bestFlight.duration}</p>
                  </div>
                  <p className="text-lg font-bold text-[#0A7A6E]">₹{bestFlight.price?.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Things to Know */}
        {thingsToKnow.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
            <h2 className="font-bold text-[#1A1A1A] mb-3">💡 Things to Know</h2>
            <div className="space-y-2">
              {thingsToKnow.slice(0, 4).map((tip: string, i: number) => (
                <p key={i} className="text-sm text-[#6B6B6B]">{tip}</p>
              ))}
            </div>
          </div>
        )}

        {/* Packing Preview */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
          <h2 className="font-bold text-[#1A1A1A] mb-3">🎒 Packing List Preview</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#FEF3C7] rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">👶</p>
              <p className="text-xs font-medium text-[#92400E]">{packingKids.length} items</p>
            </div>
            <div className="bg-[#DBEAFE] rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">👨‍👩</p>
              <p className="text-xs font-medium text-[#1E40AF]">{packingAdults.length} items</p>
            </div>
            <div className="bg-[#FED7AA] rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">🇮🇳</p>
              <p className="text-xs font-medium text-[#9A3412]">{packingIndian.length} items</p>
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] text-center mt-3">Save to see full list & check items</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <button onClick={handleSaveTrip} disabled={saving} className="w-full py-4 bg-[#0A7A6E] rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-[#0A7A6E]/30">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save This Trip'}
        </button>
      </div>
    </div>
  );
}
