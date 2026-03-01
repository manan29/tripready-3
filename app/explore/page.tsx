'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Sun, Palmtree, Mountain, Building2, Sparkles } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/navigation/BottomNav';
import { cn } from '@/lib/design-system/cn';

const CATEGORIES = [
  { id: 'beach', label: 'Beach', icon: Palmtree, color: 'text-cyan-400' },
  { id: 'mountain', label: 'Mountain', icon: Mountain, color: 'text-emerald-400' },
  { id: 'city', label: 'City', icon: Building2, color: 'text-violet-400' },
  { id: 'adventure', label: 'Adventure', icon: TrendingUp, color: 'text-orange-400' },
];

const TRENDING_DESTINATIONS = [
  { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', tag: 'Trending', temp: 28 },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', tag: 'Popular', temp: 30 },
  { name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400', tag: 'Family', temp: 31 },
  { name: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400', tag: 'Luxury', temp: 29 },
];

const CURATED_COLLECTIONS = [
  { 
    id: 'kid-friendly',
    title: 'Best for Kids', 
    subtitle: '5 destinations',
    gradient: 'from-amber-500/20 to-orange-500/20',
    icon: '👶',
  },
  { 
    id: 'budget',
    title: 'Budget Escapes', 
    subtitle: '8 destinations',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    icon: '💰',
  },
  { 
    id: 'honeymoon',
    title: 'Romantic Getaways', 
    subtitle: '6 destinations',
    gradient: 'from-pink-500/20 to-rose-500/20',
    icon: '💕',
  },
  { 
    id: 'adventure',
    title: 'Adventure Trips', 
    subtitle: '7 destinations',
    gradient: 'from-violet-500/20 to-purple-500/20',
    icon: '🏔️',
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleDestinationClick = (name: string) => {
    sessionStorage.setItem('tripPlan', JSON.stringify({ destination: name }));
    router.push('/plan');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: searchQuery }));
      router.push('/plan');
    }
  };

  return (
    <Screen className="pb-24">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-text-primary">Explore</h1>
          <p className="text-text-secondary">Discover your next adventure</p>
        </div>

        {/* Search */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border-2 transition-all duration-300',
            'bg-dark-secondary px-4 py-3',
            searchFocused 
              ? 'border-primary-400 shadow-glow-sm' 
              : 'border-border-subtle'
          )}
        >
          <Search className={cn('w-5 h-5', searchFocused ? 'text-primary-400' : 'text-text-tertiary')} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search destinations..."
            className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-tertiary"
          />
        </div>
      </header>

      <div className="px-5 py-6 space-y-8">
        {/* Categories */}
        <section>
          <h2 className="font-bold text-text-primary mb-4">Categories</h2>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: cat.label }));
                  router.push('/plan');
                }}
                className="flex flex-col items-center gap-2 p-4 bg-dark-secondary rounded-2xl border border-border-subtle hover:border-primary-400/50 hover:bg-dark-tertiary transition-all"
              >
                <cat.icon className={cn('w-6 h-6', cat.color)} />
                <span className="text-xs font-medium text-text-secondary">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text-primary">Trending Now</h2>
            <Badge variant="primary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {TRENDING_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={() => handleDestinationClick(dest.name)}
                className="flex-shrink-0 w-40 group"
              >
                <div className="relative h-48 rounded-2xl overflow-hidden border border-border-subtle group-hover:border-primary-400/50 transition-all">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-dark-primary/30 to-transparent" />
                  
                  <Badge variant="gold" className="absolute top-3 left-3">
                    {dest.tag}
                  </Badge>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold">{dest.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-text-secondary text-xs">{dest.country}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <Sun className="w-3 h-3" />
                        <span>{dest.temp}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Curated Collections */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h2 className="font-bold text-text-primary">Curated for You</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CURATED_COLLECTIONS.map((collection) => (
              <button
                key={collection.id}
                onClick={() => {
                  sessionStorage.setItem('tripPlan', JSON.stringify({ freeform_query: collection.title }));
                  router.push('/plan');
                }}
                className={cn(
                  'p-4 rounded-2xl border border-border-subtle text-left',
                  'bg-gradient-to-br hover:border-primary-400/50 transition-all',
                  collection.gradient
                )}
              >
                <span className="text-2xl">{collection.icon}</span>
                <h3 className="font-bold text-text-primary mt-2">{collection.title}</h3>
                <p className="text-xs text-text-secondary">{collection.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        {/* AI Suggestion */}
        <Card variant="elevated" padding="lg" className="relative overflow-hidden border-primary-400/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-400/20 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary">Not sure where to go?</h3>
              <p className="text-sm text-text-secondary">Let AI suggest based on your preferences</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            className="mt-4 w-full py-3 bg-primary-400 text-dark-primary rounded-xl font-semibold hover:bg-primary-300 transition-colors shadow-glow-sm"
          >
            Get AI Recommendations
          </button>
        </Card>
      </div>

      <BottomNav />
    </Screen>
  );
}
