'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mic, MicOff, X } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';

const QUICK_CHIPS = [
  '🏖️ Beach trip with 2 year old',
  '🏙️ Dubai with kids',
  '🦁 Singapore family vacation',
  '🏝️ Maldives luxury escape',
  '🌴 Thailand in summer',
  '🎢 Theme parks with toddler',
];

const DESTINATIONS = [
  { name: 'Dubai', tagline: 'Desert adventures & luxury' },
  { name: 'Singapore', tagline: 'Clean, safe & kid-friendly' },
  { name: 'Maldives', tagline: 'Crystal clear waters' },
  { name: 'Thailand', tagline: 'Culture & beaches' },
];

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  // Voice states
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const initVoiceRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setSearchQuery(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Voice error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setVoiceError('Microphone access denied. Please enable it in settings.');
          } else if (event.error === 'no-speech') {
            setVoiceError('No speech detected. Try again.');
          } else {
            setVoiceError('Voice recognition error. Try again.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSearchQuery('');
      setVoiceError(null);
      recognitionRef.current.start();
    }
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
      suggest_destination: false
    }));
    router.push('/plan');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
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
          <button onClick={() => router.push('/login')} className="text-[#0A7A6E] font-semibold text-sm">
            Sign In
          </button>
        )}
      </header>

      {/* Hero Section */}
      <div className="px-5 py-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] text-center mb-2">
          {greeting}! 👋
        </h1>
        <p className="text-[#6B6B6B] text-center mb-8">
          Where would you like to go?
        </p>

        {/* Search Bar with Voice */}
        <div className="max-w-md mx-auto mb-4">
          <div className="flex items-center gap-3 bg-[#F8F7F5] rounded-2xl px-4 py-4 border border-[#E5E5E5] shadow-sm">
            <Sparkles className="w-5 h-5 text-[#0A7A6E] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isListening ? "Listening..." : "Describe your dream trip..."}
              className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-[#9CA3AF]"
            />

            {/* Voice Button */}
            {isVoiceSupported && (
              <button
                onClick={toggleVoice}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-[#0A7A6E]'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            )}

            {searchQuery && !isListening && (
              <button onClick={handleSearch} className="bg-[#0A7A6E] text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Go
              </button>
            )}
          </div>

          {/* Voice listening indicator */}
          {isListening && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#0A7A6E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#0A7A6E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#0A7A6E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-[#0A7A6E] font-medium">Listening... speak now</span>
            </div>
          )}

          {/* Voice error */}
          {voiceError && (
            <div className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm">
              <X className="w-4 h-4" />
              <span>{voiceError}</span>
            </div>
          )}

          {/* Helper text */}
          {!isListening && !voiceError && (
            <p className="text-center text-[#9CA3AF] text-sm mt-3">
              {isVoiceSupported ? 'Type or tap 🎤 to speak' : 'Describe your trip in plain English'}
            </p>
          )}
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] hover:border-[#0A7A6E] hover:bg-[#F0FDFA] transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-5 mt-4">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Popular Destinations</h2>

        <div className="grid grid-cols-2 gap-3">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleDestinationClick(dest.name)}
              className="relative h-32 rounded-2xl overflow-hidden group"
            >
              <img
                src={getDestinationImage(dest.name)}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-semibold">{dest.name}</h3>
                <p className="text-white/70 text-xs">{dest.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="px-5 mt-8">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">How it works</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-[#F8F7F5] rounded-2xl p-4">
            <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">Tell us your plans</h3>
              <p className="text-sm text-[#6B6B6B]">Type or speak your trip idea</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[#F8F7F5] rounded-2xl p-4">
            <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">AI creates your trip</h3>
              <p className="text-sm text-[#6B6B6B]">Personalized for your family's needs</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[#F8F7F5] rounded-2xl p-4">
            <div className="w-10 h-10 bg-[#0A7A6E] rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">Save & manage</h3>
              <p className="text-sm text-[#6B6B6B]">Packing lists, bookings & more</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
