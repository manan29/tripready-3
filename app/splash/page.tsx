'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const router = useRouter();
  const [showTagline, setShowTagline] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

    if (hasSeenOnboarding) {
      router.replace('/');
      return;
    }

    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const navTimer = setTimeout(() => {
      localStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/');
    }, 3000);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div className={`min-h-screen bg-[#0A7A6E] flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="animate-scale-in">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-2 animate-fade-up">
        JourneyAI
      </h1>

      <div className={`transition-all duration-500 ${showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-white/80 text-center text-lg mb-8">
          Family travel, simplified
        </p>

        <div className="space-y-3 text-white/70 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
            <span>AI-powered trip planning</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
            <span>Smart packing lists for kids</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
            <span>Health-aware recommendations</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 flex gap-2">
        <div className="w-8 h-1 bg-white rounded-full" />
        <div className="w-2 h-1 bg-white/40 rounded-full" />
        <div className="w-2 h-1 bg-white/40 rounded-full" />
      </div>
    </div>
  );
}
