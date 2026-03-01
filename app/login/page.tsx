'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/design-system/cn';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/trips';
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        
        // Check if there's a pending trip to save
        const pendingTrip = localStorage.getItem('pendingTrip');
        if (pendingTrip) {
          router.push('/plan/save');
        } else {
          router.push(redirectTo);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Check if there's a pending trip to save
        const pendingTrip = localStorage.getItem('pendingTrip');
        if (pendingTrip) {
          router.push('/plan/save');
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <Screen className="flex flex-col">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="py-4">
          <button 
            onClick={() => router.back()} 
            className="w-11 h-11 rounded-2xl bg-dark-elevated flex items-center justify-center hover:bg-dark-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 py-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-400 flex items-center justify-center mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-dark-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-text-secondary mt-1">
            {mode === 'login' ? 'Sign in to access your trips' : 'Start planning your adventures'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-12 px-4 bg-dark-secondary border-2 border-border-subtle rounded-xl text-text-primary placeholder-text-tertiary outline-none focus:border-primary-400 focus:bg-dark-tertiary transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 pl-12 pr-4 bg-dark-secondary border-2 border-border-subtle rounded-xl text-text-primary placeholder-text-tertiary outline-none focus:border-primary-400 focus:bg-dark-tertiary transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-12 pr-12 bg-dark-secondary border-2 border-border-subtle rounded-xl text-text-primary placeholder-text-tertiary outline-none focus:border-primary-400 focus:bg-dark-tertiary transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" size="xl" fullWidth loading={loading}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-text-tertiary text-sm">or</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        {/* Google Login */}
        <Button 
          variant="secondary" 
          size="xl" 
          fullWidth 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        {/* Toggle Mode */}
        <p className="text-center text-text-secondary mt-6">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-primary-400 font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </Screen>
  );
}
