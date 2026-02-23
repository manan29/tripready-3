'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, MoreVertical, Plane, Hotel, ChevronRight,
  CloudSun, TrendingUp, TrendingDown, Minus, Upload, Baby, Users,
  MessageCircle, Share2, Calendar, Phone, AlertCircle, FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getDestinationImage } from '@/lib/destination-images';

interface WeatherData {
  current: { temp: number; weather: string; icon: string; description: string };
  forecast: { date: number; temp: number; weather: string; icon: string }[];
  trend: 'stable' | 'increasing' | 'decreasing';
  hasRain: boolean;
  location: string;
}

interface CurrencyData {
  from: string;
  to: string;
  toName: string;
  toSymbol: string;
  rate: number;
  converted: number;
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;
  const supabase = createClient();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<'pre' | 'during' | 'post'>('pre');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currency, setCurrency] = useState<CurrencyData | null>(null);
  const [convertAmount, setConvertAmount] = useState('5000');

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  useEffect(() => {
    if (trip?.destination) {
      loadWeather();
      loadCurrency();
    }
  }, [trip?.destination]);

  useEffect(() => {
    if (trip?.destination && convertAmount) {
      loadCurrency();
    }
  }, [convertAmount]);

  const loadTrip = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error || !data) {
      router.push('/trips');
      return;
    }

    setTrip(data);
    setLoading(false);
  };

  const loadWeather = async () => {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(trip.destination)}`);
      const data = await res.json();
      if (!data.error) setWeather(data);
    } catch (err) {
      console.error('Weather load failed:', err);
    }
  };

  const loadCurrency = async () => {
    try {
      const res = await fetch(`/api/currency?destination=${encodeURIComponent(trip.destination)}&amount=${convertAmount}`);
      const data = await res.json();
      setCurrency(data);
    } catch (err) {
      console.error('Currency load failed:', err);
    }
  };

  const getWeatherIcon = (weather: string) => {
    const w = weather.toLowerCase();
    if (w.includes('rain') || w.includes('storm')) return '🌧️';
    if (w.includes('cloud')) return '🌤️';
    if (w.includes('clear') || w.includes('sun')) return '☀️';
    if (w.includes('snow')) return '❄️';
    return '🌤️';
  };

  const getDaysToGo = () => {
    if (!trip?.start_date) return 0;
    const start = new Date(trip.start_date);
    const today = new Date();
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getPackingProgress = () => {
    const list = trip?.packing_list || [];
    if (list.length === 0) return { packed: 0, total: 0, percent: 0 };
    const packed = list.filter((i: any) => i.checked).length;
    return { packed, total: list.length, percent: Math.round((packed / list.length) * 100) };
  };

  const packingProgress = getPackingProgress();
  const daysToGo = getDaysToGo();
  const preferences = trip?.trip_preferences || {};
  const flightRec = preferences.flight_recommendation || {};
  const hotelRec = preferences.hotel_recommendation || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0A7A6E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-24">
      {/* Hero Header */}
      <div className="relative h-56">
        <img
          src={getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <button onClick={() => router.push('/trips')} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-white font-bold text-2xl">{trip.destination}</h1>
          <p className="text-white/80 text-sm">
            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {daysToGo > 0 && ` • ${daysToGo} days to go`}
          </p>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="px-5 -mt-4">
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm">
          {['pre', 'during', 'post'].map((phase) => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize ${activePhase === phase ? 'bg-[#0A7A6E] text-white' : 'text-[#6B6B6B]'}`}
            >
              {phase === 'pre' ? 'Pre-Trip' : phase === 'during' ? 'During' : 'Post'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Trip Ready Score */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#1A1A1A]">Trip Ready Score</span>
            <span className="text-lg font-bold text-[#0A7A6E]">{packingProgress.percent}%</span>
          </div>
          <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div className="h-full bg-[#0A7A6E] rounded-full transition-all" style={{ width: `${packingProgress.percent}%` }} />
          </div>
        </div>

        {/* Packing List Section */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎒</span>
              <h2 className="font-semibold text-[#1A1A1A]">Packing List</h2>
            </div>
            <button onClick={() => router.push(`/trips/${tripId}/packing`)} className="text-[#0A7A6E] text-sm font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#0A7A6E] rounded-full" style={{ width: `${packingProgress.percent}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => router.push(`/trips/${tripId}/packing`)} className="bg-[#F8F7F5] rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-5 h-5 text-[#0A7A6E]" />
                <span className="font-medium text-[#1A1A1A]">Kids</span>
              </div>
              <p className="text-sm text-[#6B6B6B]">
                {(trip.packing_list || []).filter((i: any) => (i.category === 'kids' || i.category === 'priority') && i.checked).length}/
                {(trip.packing_list || []).filter((i: any) => i.category === 'kids' || i.category === 'priority').length} packed
              </p>
            </button>
            <button onClick={() => router.push(`/trips/${tripId}/packing`)} className="bg-[#F8F7F5] rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#0A7A6E]" />
                <span className="font-medium text-[#1A1A1A]">Adults</span>
              </div>
              <p className="text-sm text-[#6B6B6B]">
                {(trip.packing_list || []).filter((i: any) => i.category === 'adults' && i.checked).length}/
                {(trip.packing_list || []).filter((i: any) => i.category === 'adults').length} packed
              </p>
            </button>
          </div>

          {(trip.packing_list || []).filter((i: any) => i.category === 'priority' && !i.checked).length > 0 && (
            <div className="bg-red-50 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Priority items not packed</p>
                <p className="text-xs text-red-600">
                  {(trip.packing_list || []).filter((i: any) => i.category === 'priority' && !i.checked).map((i: any) => i.text).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Flights Section */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-[#0A7A6E]" />
            <h2 className="font-semibold text-[#1A1A1A]">Flights</h2>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Not booked</span>
          </div>

          {flightRec.airline && (
            <>
              <p className="text-sm text-[#6B6B6B] mb-3">Based on your preferences:</p>
              <div className="border border-[#0A7A6E] rounded-xl p-4 mb-3 relative">
                <span className="absolute -top-2.5 right-3 bg-[#0A7A6E] text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1A1A1A]">{flightRec.airline} {flightRec.flight_number}</span>
                </div>
                <p className="text-sm text-[#6B6B6B]">BOM → {trip.destination?.substring(0, 3).toUpperCase()} • {flightRec.departure_time} - {flightRec.arrival_time}</p>
                <p className="text-sm text-[#0A7A6E] font-semibold mt-2">₹{(flightRec.price_per_person || 0).toLocaleString()}/person</p>
                {flightRec.why_recommended && (
                  <p className="text-xs text-[#6B6B6B] mt-2 bg-[#F8F7F5] rounded-lg p-2">{flightRec.why_recommended}</p>
                )}
              </div>
            </>
          )}

          <div className="border-t border-dashed border-[#E5E5E5] pt-3 mt-3">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#F8F7F5] rounded-xl text-[#6B6B6B]">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Already booked? Upload confirmation</span>
            </button>
          </div>
        </div>

        {/* Stay Section */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Hotel className="w-5 h-5 text-[#0A7A6E]" />
            <h2 className="font-semibold text-[#1A1A1A]">Stay</h2>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Not booked</span>
          </div>

          {hotelRec.name && (
            <>
              <p className="text-sm text-[#6B6B6B] mb-3">
                Based on: {preferences.hotel_rating}⭐ • {(preferences.amenities || []).join(' • ')}
              </p>
              <div className="border border-[#0A7A6E] rounded-xl overflow-hidden mb-3 relative">
                <span className="absolute top-3 right-3 bg-[#0A7A6E] text-white text-xs px-2 py-0.5 rounded-full z-10">Best Match</span>
                <img src={getDestinationImage(trip.destination)} alt={hotelRec.name} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-[#1A1A1A]">{hotelRec.name}</h3>
                  <p className="text-sm text-[#6B6B6B]">{'⭐'.repeat(hotelRec.rating || 4)}</p>
                  <p className="text-sm text-[#0A7A6E] font-semibold mt-1">₹{(hotelRec.price_per_night || 0).toLocaleString()}/night</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(hotelRec.amenities || []).slice(0, 4).map((a: string) => (
                      <span key={a} className="text-xs bg-[#F0FDFA] text-[#0A7A6E] px-2 py-0.5 rounded-full">✓ {a}</span>
                    ))}
                  </div>
                  {hotelRec.health_features && (
                    <p className="text-xs text-[#6B6B6B] mt-2 bg-[#F8F7F5] rounded-lg p-2">💡 {hotelRec.health_features}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-[#E5E5E5] pt-3 mt-3">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#F8F7F5] rounded-xl text-[#6B6B6B]">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Already booked? Upload confirmation</span>
            </button>
          </div>
        </div>

        {/* Weather Section */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CloudSun className="w-5 h-5 text-[#0A7A6E]" />
            <h2 className="font-semibold text-[#1A1A1A]">Weather Forecast</h2>
          </div>

          {weather ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{getWeatherIcon(weather.current.weather)}</span>
                <div>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{weather.current.temp}°C</p>
                  <p className="text-sm text-[#6B6B6B]">{weather.current.description}</p>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {weather.forecast.map((day, i) => (
                  <div key={i} className="flex-shrink-0 w-14 text-center bg-[#F8F7F5] rounded-xl p-2">
                    <p className="text-xs text-[#6B6B6B]">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-lg my-1">{getWeatherIcon(day.weather)}</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{day.temp}°</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-[#F8F7F5] rounded-xl p-3">
                {weather.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-orange-500" />}
                {weather.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-blue-500" />}
                {weather.trend === 'stable' && <Minus className="w-4 h-4 text-green-500" />}
                <span className="text-sm text-[#6B6B6B]">
                  Trend: {weather.trend === 'stable' ? 'Stable temperatures' : weather.trend === 'increasing' ? 'Getting warmer' : 'Getting cooler'}
                  {weather.hasRain && ' • Pack rain gear!'}
                </span>
              </div>
            </>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#0A7A6E] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Currency Section */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💱</span>
            <h2 className="font-semibold text-[#1A1A1A]">Currency</h2>
          </div>

          {currency ? (
            <>
              <p className="text-sm text-[#6B6B6B] mb-4">🇮🇳 INR → {currency.toSymbol} {currency.toName}</p>

              <div className="bg-[#F8F7F5] rounded-xl p-3 mb-3">
                <label className="text-xs text-[#6B6B6B]">You have (INR)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">₹</span>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="flex-1 bg-transparent text-xl font-semibold text-[#1A1A1A] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-center my-2">
                <div className="w-8 h-8 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white text-sm">⇅</div>
              </div>

              <div className="bg-[#F0FDFA] rounded-xl p-3">
                <label className="text-xs text-[#6B6B6B]">You get ({currency.to})</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currency.toSymbol}</span>
                  <span className="text-xl font-semibold text-[#0A7A6E]">{currency.converted.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-center text-[#9CA3AF] mt-3">Rate: ₹1 = {currency.toSymbol}{currency.rate.toFixed(4)}</p>
            </>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#0A7A6E] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#0A7A6E]" />
            <h2 className="font-semibold text-[#1A1A1A]">Documents</h2>
          </div>

          <div className="bg-[#F0FDFA] rounded-xl p-3 mb-4">
            <p className="text-sm text-[#0A7A6E]">🇲🇻 Visa: On arrival (Free for 30 days) ✓</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['Passport 1', 'Passport 2', 'Tickets', 'Insurance'].map((doc, i) => (
              <button key={doc} className="flex flex-col items-center gap-1 p-3 bg-[#F8F7F5] rounded-xl">
                <span className="text-2xl">{i < 2 ? '🛂' : i === 2 ? '✈️' : '🛡️'}</span>
                <span className="text-xs text-[#6B6B6B] text-center">{doc}</span>
                <span className="text-xs text-[#9CA3AF]">○</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center gap-2 p-3">
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#0A7A6E]" />
              </div>
              <span className="text-xs text-[#6B6B6B]">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3">
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-[#0A7A6E]" />
              </div>
              <span className="text-xs text-[#6B6B6B]">Share</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3">
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#0A7A6E]" />
              </div>
              <span className="text-xs text-[#6B6B6B]">Calendar</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3">
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#0A7A6E]" />
              </div>
              <span className="text-xs text-[#6B6B6B]">Emergency</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
