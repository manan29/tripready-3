'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Loader2, ArrowLeft, TrendingDown, Plane } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const LOADING_STEPS = [
  'Analyzing your trip...',
  'Checking weather conditions...',
  'Finding direct flights...',
  'Comparing prices for next 20 days...',
  'Building your packing list...',
  'Adding Indian family essentials...',
  'Finalizing recommendations...',
];

interface FlightTrend {
  date: string;
  price: number;
  day: string;
}

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
    if (!stored) { router.push('/plan'); return; }

    const data = JSON.parse(stored);
    setTripData(data);
    checkAuth();
    generatePlan(data);
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const generatePlan = async (data: any) => {
    const stepInterval = setInterval(() => {
      setCurrentLoadingStep(prev => {
        if (prev >= LOADING_STEPS.length - 1) { clearInterval(stepInterval); return prev; }
        return prev + 1;
      });
    }, 600);

    try {
      const [flightRes, weatherRes, imageRes, aiRes] = await Promise.all([
        fetch(`/api/flights/trends?destination=${encodeURIComponent(data.destination)}&startDate=${data.start_date}&fromCity=${encodeURIComponent(data.from_city || 'Mumbai')}`),
        fetch(`/api/weather?city=${encodeURIComponent(data.destination)}`),
        fetch(`/api/images/destination?destination=${encodeURIComponent(data.destination)}`),
        fetch('/api/ai/plan-trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: data.destination,
            start_date: data.start_date,
            duration: data.duration,
            adults: 2,
            kids: data.kids,
            kid_ages: data.kid_ages,
            health_conditions: data.health_conditions,
            airline: data.airline,
            hotel_rating: data.hotel_rating,
            amenities: data.amenities,
          }),
        }),
      ]);

      const [flightData, weatherData, imageData, aiData] = await Promise.all([
        flightRes.json(),
        weatherRes.json(),
        imageRes.json(),
        aiRes.json(),
      ]);

      setFlightTrends(flightData);
      setWeather(weatherData);
      setDestinationImage(imageData.url || '');
      setTripPlan(aiData);

      clearInterval(stepInterval);
      setCurrentLoadingStep(LOADING_STEPS.length);

      setTimeout(() => setStep('results'), 500);

    } catch (error) {
      console.error('Failed to generate plan:', error);
      clearInterval(stepInterval);
      setTripPlan(getFallbackPlan(data));
      setStep('results');
    }
  };

  const getFallbackPlan = (data: any) => ({
    honest_take: {
      weather_reality: `${data.destination} will be warm during your visit. Plan outdoor activities for mornings and evenings.`,
      best_time_of_day: "Before 10 AM and after 4 PM for outdoor activities",
      kid_friendliness: 5,
      highlights: ['Family-friendly attractions', 'Great food options', 'Safe destination'],
      warnings: ['Book popular attractions in advance', 'Carry light jacket for AC']
    },
    things_to_know: [
      '🛂 Visa: Check requirements for Indians - most destinations offer e-visa',
      '💱 Currency: Carry forex card + some local currency',
      '🚕 Transport: Uber/local apps work well',
      '📱 Get local SIM at airport for data',
      '🏥 Keep travel insurance details handy'
    ],
    packing_list: {
      kids: [
        'Light cotton clothes (5-6 sets)',
        'Comfortable walking shoes',
        'Swimwear (2 sets) + floaties',
        'Sun hat + UV sunglasses',
        'Sunscreen SPF 50+',
        'Light jacket for AC',
        'Favorite snacks from home',
        'Comfort toy for flights',
        'Kids headphones + tablet',
        'Water bottle',
        'Medicines: Calpol, ORS, band-aids',
        'Wet wipes & sanitizer'
      ],
      adults: [
        'Passport (6+ months validity) + copies',
        'Visa printout',
        'Travel insurance docs',
        'Forex card + local currency',
        'Power adapter',
        'Modest clothing',
        'Sunglasses + sunscreen',
        'Comfortable walking shoes',
        'Light cardigan for AC',
        'Prescription meds + doctor note'
      ],
      indian_essentials: [
        'Hing (asafoetida)',
        'MTR/Haldiram ready meals',
        'Maggi for kids',
        'Pickle/Achaar',
        'Chai powder',
        'Namkeen snacks'
      ]
    }
  });

  const handleSaveTrip = async () => {
    if (!isLoggedIn) {
      localStorage.setItem('pendingTrip', JSON.stringify({ tripData, tripPlan, flightTrends }));
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

      const startDate = new Date(tripData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + tripData.duration - 1);

      const packingList = [
        ...(tripPlan.packing_list?.kids || []).map((item: string, i: number) => ({
          id: `k${i}`, text: item, checked: false, category: 'kids'
        })),
        ...(tripPlan.packing_list?.adults || []).map((item: string, i: number) => ({
          id: `a${i}`, text: item, checked: false, category: 'adults'
        })),
        ...(tripPlan.packing_list?.indian_essentials || []).map((item: string, i: number) => ({
          id: `i${i}`, text: item, checked: false, category: 'indian'
        })),
      ];

      const { data, error } = await supabase
        .from('trips')
        .insert({
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
    localStorage.setItem('pendingTrip', JSON.stringify({ tripData, tripPlan, flightTrends }));
    router.push('/login?redirect=/plan/save');
  };

  // Loading State
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5">
        <Sparkles className="w-16 h-16 text-[#0A7A6E] animate-pulse mb-6" />
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Planning your trip...</h2>
        <p className="text-[#6B6B6B] mb-8">This takes about 10 seconds</p>

        <div className="w-full max-w-sm space-y-3">
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
              <span className={index <= currentLoadingStep ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}>{loadingStep}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Signup State
  if (step === 'signup') {
    const totalItems = (tripPlan?.packing_list?.kids?.length || 0) +
                       (tripPlan?.packing_list?.adults?.length || 0) +
                       (tripPlan?.packing_list?.indian_essentials?.length || 0);
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-5 pt-12 pb-4">
          <button onClick={() => setStep('results')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <Sparkles className="w-16 h-16 text-[#0A7A6E] mb-6" />
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 text-center">Save Your Trip</h2>
          <p className="text-[#6B6B6B] text-center mb-6">Sign up to access your packing list anytime</p>

          <div className="w-full max-w-sm bg-[#F8F7F5] rounded-2xl p-4 mb-8 space-y-3">
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-[#0A7A6E]" /><span>Full packing list ({totalItems} items)</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-[#0A7A6E]" /><span>Flight price alerts</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-[#0A7A6E]" /><span>Trip reminders</span></div>
          </div>

          <button onClick={handleLoginRedirect} className="w-full max-w-sm bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold mb-4">Sign Up / Login</button>
          <button onClick={() => router.push('/')} className="text-[#6B6B6B] font-medium">Maybe Later</button>
        </div>
      </div>
    );
  }

  // Results State
  const destination = tripData?.destination || 'Destination';
  const fromCity = tripData?.from_city || 'Mumbai';
  const trends = flightTrends?.trends || [];
  const hasTrends = flightTrends?.hasTrends && trends.length > 0;
  const lowestPrice = flightTrends?.lowestPrice || 0;
  const lowestDate = flightTrends?.lowestDate;
  const savings = flightTrends?.savings || 0;
  const directFlights = flightTrends?.directFlights || {};
  const bestFlight = flightTrends?.bestFlight || {};
  const recommendation = flightTrends?.recommendation || '';
  const honestTake = tripPlan?.honest_take || {};
  const thingsToKnow = tripPlan?.things_to_know || [];
  const packingKids = tripPlan?.packing_list?.kids || [];
  const packingAdults = tripPlan?.packing_list?.adults || [];
  const packingIndian = tripPlan?.packing_list?.indian_essentials || [];

  // Calculate price chart dimensions
  const prices = trends.map((t: FlightTrend) => t.price);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 20000;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 10000;
  const priceRange = maxPrice - minPrice || 1;

  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-32">
      {/* Hero with real destination image */}
      <div className="relative h-48">
        <img
          src={destinationImage || `https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80`}
          alt={destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <button onClick={() => router.push('/plan/preferences')} className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-white font-bold text-2xl">{destination}</h1>
          <p className="text-white/80 text-sm">
            {tripData?.start_date && new Date(tripData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tripData?.duration} days • From {fromCity}
          </p>
          <p className="text-white/60 text-xs mt-1">
            2 adults, {tripData?.kids} kid{tripData?.kids > 1 ? 's' : ''} ({tripData?.kid_ages?.join(', ')} yr)
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Honest Take */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-[#1A1A1A] mb-3">🌡️ The Honest Take</h2>
          <div className="space-y-3 text-sm text-[#6B6B6B]">
            {weather?.current && (
              <p>
                📍 {destination} in {new Date(tripData.start_date).toLocaleDateString('en-US', { month: 'long' })}:
                <span className="font-medium text-[#1A1A1A]"> {weather.current.temp}°C</span> -
                {weather.current.temp > 35 ? " Hot! Plan indoor activities for midday." :
                 weather.current.temp > 30 ? " Warm but manageable. Mornings & evenings best for outdoors." :
                 " Pleasant weather for sightseeing."}
              </p>
            )}
            {honestTake.weather_reality && (
              <p>{honestTake.weather_reality}</p>
            )}
            <div>
              <p className="font-medium text-[#1A1A1A] mb-1">✈️ Direct Flights from India:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(directFlights).map(([city, count]) => (
                  <span key={city} className={city === fromCity ? 'font-semibold text-[#0A7A6E]' : ''}>
                    • {city}: {count as number} daily {city === fromCity && '(your city)'}
                  </span>
                ))}
              </div>
            </div>
            <p>👶 Kid-friendliness: {'\u2b50'.repeat(honestTake.kid_friendliness || 4)}</p>
          </div>
        </div>

        {/* Flight Price Trends */}
        {hasTrends && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="w-5 h-5 text-[#0A7A6E]" />
              <h2 className="font-bold text-[#1A1A1A]">Flight Price Trends</h2>
              <span className="text-xs bg-[#F0FDFA] text-[#0A7A6E] px-2 py-0.5 rounded-full">Direct only</span>
            </div>

            <p className="text-sm text-[#6B6B6B] mb-2">📍 From: <span className="font-medium text-[#1A1A1A]">{fromCity}</span></p>
            <p className="text-sm text-[#6B6B6B] mb-4">🌅 Best time to fly: <span className="font-medium text-[#1A1A1A]">Morning 6-9 AM</span> (arrive by noon, full day ahead)</p>

            {/* Price Chart */}
            <div className="bg-[#F8F7F5] rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#6B6B6B]">💹 Price trend (next 20 days)</span>
                <span className="text-xs text-[#0A7A6E] font-medium">
                  Lowest: ₹{lowestPrice.toLocaleString()}
                </span>
              </div>

              <div className="h-24 flex items-end gap-0.5">
                {trends.slice(0, 20).map((t: FlightTrend, i: number) => {
                  const heightPercent = ((t.price - minPrice) / priceRange) * 100;
                  const isLowest = t.price === lowestPrice;
                  const isSelected = i === 0;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isLowest ? 'bg-green-500' :
                          isSelected ? 'bg-[#0A7A6E]' :
                          'bg-[#CBD5E1] hover:bg-[#94A3B8]'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {t.day} - ₹{t.price.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-2 text-xs text-[#9CA3AF]">
                <span>{new Date(tripData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>+20 days</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#0A7A6E] rounded" />
                  <span className="text-[#6B6B6B]">Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-[#6B6B6B]">Lowest</span>
                </div>
              </div>
            </div>

            {/* Savings recommendation */}
            {savings > 500 && (
              <div className="bg-green-50 rounded-xl p-3 mb-4 flex items-start gap-2">
                <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-green-700">{recommendation}</span>
                  <p className="text-xs text-green-600 mt-1">
                    Your date: ₹{flightTrends.selectedDatePrice?.toLocaleString()} → Best date: ₹{lowestPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Best Flight Card */}
            {bestFlight.airline && (
              <div className="border border-[#0A7A6E] rounded-xl p-4 relative">
                <span className="absolute -top-2.5 right-3 bg-[#0A7A6E] text-white text-xs px-2 py-0.5 rounded-full">Best Flight</span>
                <p className="font-semibold text-[#1A1A1A]">{bestFlight.airline} {bestFlight.flightNumber}</p>
                <p className="text-sm text-[#6B6B6B]">
                  {fromCity} → {destination} • Depart: {bestFlight.departure} → Arrive: {bestFlight.arrival}
                </p>
                <p className="text-sm text-[#0A7A6E] font-semibold mt-1">
                  ₹{bestFlight.price?.toLocaleString()}/person • Direct • {bestFlight.duration}
                </p>
                <div className="mt-2 text-xs text-[#6B6B6B] space-y-1">
                  <p>✓ Morning arrival = full first day</p>
                  {bestFlight.aircraft === 'A380' && <p>✓ A380 aircraft (more space for kids)</p>}
                  {bestFlight.aircraft === 'A350' && <p>✓ A350 aircraft (quieter cabin)</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Things to Know */}
        {thingsToKnow.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="font-bold text-[#1A1A1A] mb-3">⚠️ Things to Know Right Now</h2>
            <div className="space-y-2">
              {thingsToKnow.map((item: string, i: number) => (
                <p key={i} className="text-sm text-[#6B6B6B]">{item}</p>
              ))}
            </div>
          </div>
        )}

        {/* Packing List */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1A1A1A]">🎒 Packing List</h2>
            <span className="text-sm text-[#6B6B6B]">{packingKids.length + packingAdults.length + packingIndian.length} items</span>
          </div>

          <div className="space-y-4">
            {/* Kids */}
            {packingKids.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#0A7A6E] mb-2">
                  👶 FOR YOUR {tripData?.kid_ages?.join(' & ')} YEAR OLD{tripData?.kids > 1 ? 'S' : ''}
                </p>
                <div className="space-y-1.5">
                  {packingKids.map((item: string, i: number) => (
                    <p key={i} className="text-sm text-[#1A1A1A] flex items-start gap-2">
                      <span className="text-[#9CA3AF]">☐</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Adults */}
            {packingAdults.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#0A7A6E] mb-2">👨‍👩‍👧 FOR ADULTS</p>
                <div className="space-y-1.5">
                  {packingAdults.map((item: string, i: number) => (
                    <p key={i} className="text-sm text-[#1A1A1A] flex items-start gap-2">
                      <span className="text-[#9CA3AF]">☐</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Indian Essentials */}
            {packingIndian.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#0A7A6E] mb-2">🇮🇳 INDIAN ESSENTIALS</p>
                <div className="space-y-1.5">
                  {packingIndian.map((item: string, i: number) => (
                    <p key={i} className="text-sm text-[#1A1A1A] flex items-start gap-2">
                      <span className="text-[#9CA3AF]">☐</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F0F0F0]">
        <button
          onClick={handleSaveTrip}
          disabled={saving}
          className="w-full py-4 rounded-xl font-semibold bg-[#0A7A6E] text-white flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Save This Trip</>
          )}
        </button>
      </div>
    </div>
  );
}
