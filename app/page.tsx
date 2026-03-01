'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mic, MicOff, X, ChevronRight } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { createClient } from '@/lib/supabase/client';

const QUICK_CHIPS = [
  '🏖️ Beach with kids',
  '🏙️ Dubai family trip',
  '🦁 Singapore vacation',
  '🏝️ Maldives getaway',
  '🌴 Thailand adventure',
  '🎢 Theme parks',
  '⛰️ Hill station escape',
  '🏰 Europe with family',
];

interface SeasonalDestination {
  name: string;
  country: string;
  flag: string;
  temp: number;
  weather: string;
  isPeak: boolean;
  discount?: number | null;
}

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Good morning');
  const [peakDestinations, setPeakDestinations] = useState<SeasonalDestination[]>([]);
  const [shoulderDestinations, setShoulderDestinations] = useState<SeasonalDestination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    checkAuth();
    initVoiceRecognition();
    fetchSeasonalDestinations();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchSeasonalDestinations = async () => {
    try {
      const res = await fetch('/api/destinations/seasonal');
      const data = await res.json();
      if (data.peak) setPeakDestinations(data.peak);
      if (data.shoulder) setShoulderDestinations(data.shoulder);
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    }
    setLoadingDestinations(false);
  };

  const initVoiceRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => { setIsListening(true); setVoiceError(null); };
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
          setSearchQuery(transcript);
        };
        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed') setVoiceError('Microphone access denied');
          else setVoiceError('Voice error. Try again.');
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else { setSearchQuery(''); setVoiceError(null); recognitionRef.current.start(); }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: searchQuery }));
      router.push('/plan');
    }
  };

  const handleChipClick = (chip: string) => {
    const cleanChip = chip.replace(/^[^\w\s]+\s*/, '');
    sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: cleanChip }));
    router.push('/plan');
  };

  const handleDestinationClick = (destination: string) => {
    sessionStorage.setItem('tripPlan', JSON.stringify({
      freeform_query: `Family trip to ${destination}`,
      destination: destination,
    }));
    router.push('/plan');
  };

  const getWeatherIcon = (weather: string) => {
    const w = weather.toLowerCase();
    if (w.includes('rain')) return '🌧️';
    if (w.includes('cloud')) return '🌤️';
    if (w.includes('clear') || w.includes('sun')) return '☀️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-5 pt-12 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0A7A6E] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#1A1A1A]">JourneyAI</span>
        </div>
        {user ? (
          <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        ) : (
          <button onClick={() => router.push('/login')} className="text-[#0A7A6E] font-semibold text-sm">Sign In</button>
        )}
      </header>

      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] text-center mb-1">{greeting}! 👋</h1>
        <p className="text-[#6B6B6B] text-center mb-6">Where are you going?</p>

        <div className="max-w-md mx-auto mb-4">
          <div className="flex items-center gap-3 bg-[#F8F7F5] rounded-2xl px-4 py-4 border border-[#E5E5E5] shadow-sm">
            <Sparkles className="w-5 h-5 text-[#0A7A6E] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isListening ? "Listening..." : "Search destination..."}
              className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-[#9CA3AF]"
            />
            {isVoiceSupported && (
              <button onClick={toggleVoice} className={`w-10 h-10 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#0A7A6E]'}`}>
                {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            )}
            {searchQuery && !isListening && (
              <button onClick={handleSearch} className="bg-[#0A7A6E] text-white px-4 py-2 rounded-xl text-sm font-semibold">Go</button>
            )}
          </div>
          {isListening && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#0A7A6E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#0A7A6E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#0A7A6E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-[#0A7A6E] font-medium">Listening...</span>
            </div>
          )}
          {voiceError && (
            <div className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm">
              <X className="w-4 h-4" /><span>{voiceError}</span>
            </div>
          )}
        </div>

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
          {QUICK_CHIPS.map((chip) => (
            <button key={chip} onClick={() => handleChipClick(chip)} className="flex-shrink-0 px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] whitespace-nowrap hover:border-[#0A7A6E] hover:bg-[#F0FDFA] transition-colors">
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <div>
              <h2 className="font-bold text-[#1A1A1A]">Great Now</h2>
              <p className="text-xs text-[#6B6B6B]">Peak season - perfect weather, expect crowds</p>
            </div>
          </div>

          {loadingDestinations ? (
            <div className="flex gap-3 overflow-x-auto">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex-shrink-0 w-28 h-24 bg-[#F8F7F5] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
              {peakDestinations.map((dest) => (
                <button key={dest.name} onClick={() => handleDestinationClick(dest.name)} className="flex-shrink-0 w-28 bg-white border border-[#E5E5E5] rounded-2xl p-3 text-left hover:border-[#0A7A6E] transition-colors">
                  <span className="text-2xl">{dest.flag}</span>
                  <p className="font-semibold text-[#1A1A1A] text-sm mt-1">{dest.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{dest.temp}°C {getWeatherIcon(dest.weather)}</p>
                  <span className="text-xs text-orange-600 font-medium">Peak</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💎</span>
            <div>
              <h2 className="font-bold text-[#1A1A1A]">Hidden Gems</h2>
              <p className="text-xs text-[#6B6B6B]">Shoulder season - great value, fewer tourists</p>
            </div>
          </div>

          {loadingDestinations ? (
            <div className="flex gap-3 overflow-x-auto">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex-shrink-0 w-28 h-24 bg-[#F8F7F5] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
              {shoulderDestinations.map((dest) => (
                <button key={dest.name} onClick={() => handleDestinationClick(dest.name)} className="flex-shrink-0 w-28 bg-white border border-[#E5E5E5] rounded-2xl p-3 text-left hover:border-[#0A7A6E] transition-colors">
                  <span className="text-2xl">{dest.flag}</span>
                  <p className="font-semibold text-[#1A1A1A] text-sm mt-1">{dest.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{dest.temp}°C {getWeatherIcon(dest.weather)}</p>
                  {dest.discount && <span className="text-xs text-green-600 font-medium">-{dest.discount}%</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-bold text-[#1A1A1A] mb-3">How it works</h2>
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
              <p className="text-xs text-[#6B6B6B]">Tell us where</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
              <p className="text-xs text-[#6B6B6B]">AI plans</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
              <p className="text-xs text-[#6B6B6B]">Save & pack</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
