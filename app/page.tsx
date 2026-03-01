'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, MicOff, Sparkles, ChevronRight, TrendingUp, Sun, CloudRain } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/navigation/BottomNav';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/design-system/cn';

interface SeasonalDestination {
  name: string;
  flag: string;
  temp: number;
  weather: string;
  isPeak: boolean;
  discount?: number | null;
  image?: string;
}

const DESTINATION_IMAGES: Record<string, string> = {
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
  'Vietnam': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400&q=80',
  'Sri Lanka': 'https://images.unsplash.com/photo-1586613835341-bd7d6a513837?w=400&q=80',
  'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80',
};

const QUICK_SUGGESTIONS = [
  { icon: '🏖️', label: 'Beach Trip' },
  { icon: '🏔️', label: 'Mountains' },
  { icon: '🎢', label: 'Theme Parks' },
  { icon: '🏛️', label: 'Heritage' },
];

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [peakDestinations, setPeakDestinations] = useState<SeasonalDestination[]>([]);
  const [shoulderDestinations, setShoulderDestinations] = useState<SeasonalDestination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    checkAuth();
    initVoice();
    fetchDestinations();

    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/destinations/seasonal');
      const data = await res.json();
      if (data.peak) setPeakDestinations(data.peak.map((d: any) => ({ ...d, image: DESTINATION_IMAGES[d.name] })));
      if (data.shoulder) setShoulderDestinations(data.shoulder.map((d: any) => ({ ...d, image: DESTINATION_IMAGES[d.name] })));
    } catch (err) {
      console.error(err);
    }
    setLoadingDestinations(false);
  };

  const initVoice = () => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        setIsVoiceSupported(true);
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e: any) => {
          const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
          setSearchQuery(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else { setSearchQuery(''); recognitionRef.current.start(); }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: searchQuery }));
      router.push('/plan');
    }
  };

  const handleDestinationClick = (name: string) => {
    sessionStorage.setItem('tripPlan', JSON.stringify({ destination: name, freeform_query: `Family trip to ${name}` }));
    router.push('/plan');
  };

  const handleSuggestionClick = (label: string) => {
    sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: label }));
    router.push('/plan');
  };

  return (
    <Screen className="pb-24">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-400 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-dark-primary" />
            </div>
            <span className="font-bold text-lg text-text-primary">JourneyAI</span>
          </div>

          {user ? (
            <button
              onClick={() => router.push('/profile')}
              className="w-9 h-9 rounded-full bg-primary-400 flex items-center justify-center shadow-glow-sm"
            >
              <span className="text-dark-primary font-semibold text-sm">
                {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
              </span>
            </button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-5 py-6">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
          {greeting} 👋
        </h1>
        <p className="text-text-secondary mt-1">Where's your next adventure?</p>

        {/* Search Bar */}
        <div className="mt-6">
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border-2 transition-all duration-300',
              'bg-dark-secondary px-4 py-3',
              searchFocused
                ? 'border-primary-400 shadow-glow'
                : 'border-border-default shadow-dark-md'
            )}
          >
            <Search className={cn('w-5 h-5 transition-colors', searchFocused ? 'text-primary-400' : 'text-text-tertiary')} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isListening ? 'Listening...' : 'Try "Dubai with 5 year old"'}
              className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-tertiary"
            />
            {isVoiceSupported && (
              <button
                onClick={toggleVoice}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  isListening
                    ? 'bg-red-500 animate-pulse shadow-glow'
                    : 'bg-dark-elevated hover:bg-dark-tertiary'
                )}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-text-secondary" />
                )}
              </button>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestionClick(s.label)}
                className="flex items-center gap-1.5 px-4 py-2 bg-dark-elevated border border-border-default rounded-full text-sm font-medium text-text-secondary whitespace-nowrap hover:border-primary-400 hover:bg-primary-400/10 transition-colors"
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Peak Season Destinations */}
      <section className="py-6">
        <div className="px-5 flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg text-text-primary">Perfect Now</h2>
            </div>
            <p className="text-sm text-text-tertiary mt-0.5">Peak season • Great weather</p>
          </div>
          <Badge variant="warning">Popular</Badge>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5">
          {loadingDestinations ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 h-44 bg-dark-elevated rounded-2xl animate-pulse" />
            ))
          ) : (
            peakDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => handleDestinationClick(dest.name)}
                className="flex-shrink-0 w-36 group"
              >
                <div className="relative h-44 rounded-2xl overflow-hidden shadow-dark-md group-hover:shadow-glow transition-shadow border border-border-subtle">
                  <img
                    src={dest.image || DESTINATION_IMAGES[dest.name] || DESTINATION_IMAGES['Dubai']}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-dark-primary/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold">{dest.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-white/90 text-sm">{dest.temp}°</span>
                      <span className="text-text-tertiary text-xs">• Peak</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Shoulder Season Destinations */}
      <section className="py-6">
        <div className="px-5 flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-lg text-text-primary">Best Value</h2>
            </div>
            <p className="text-sm text-text-tertiary mt-0.5">Shoulder season • Fewer crowds</p>
          </div>
          <Badge variant="success">Save 20-40%</Badge>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5">
          {loadingDestinations ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 h-44 bg-dark-elevated rounded-2xl animate-pulse" />
            ))
          ) : (
            shoulderDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => handleDestinationClick(dest.name)}
                className="flex-shrink-0 w-36 group"
              >
                <div className="relative h-44 rounded-2xl overflow-hidden shadow-dark-md group-hover:shadow-glow transition-shadow border border-border-subtle">
                  <img
                    src={dest.image || DESTINATION_IMAGES[dest.name] || DESTINATION_IMAGES['Dubai']}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-dark-primary/60 to-transparent" />
                  {dest.discount && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-glow-sm">
                      -{dest.discount}%
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold">{dest.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-white/90 text-sm">{dest.temp}°</span>
                      <span className="text-emerald-400 text-xs">• Value</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-5 py-6">
        <Card variant="elevated" padding="lg">
          <h3 className="font-bold text-text-primary mb-4">How JourneyAI works</h3>
          <div className="flex gap-4">
            {[
              { step: '1', title: 'Tell us', desc: 'Where & when' },
              { step: '2', title: 'AI plans', desc: 'Smart insights' },
              { step: '3', title: 'Pack & go', desc: 'Custom list' },
            ].map((item, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="w-10 h-10 rounded-full bg-primary-400 text-dark-primary font-bold flex items-center justify-center mx-auto mb-2 shadow-glow">
                  {item.step}
                </div>
                <p className="font-semibold text-text-primary text-sm">{item.title}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <BottomNav />
    </Screen>
  );
}
