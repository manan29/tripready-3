'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, LogOut, ChevronRight, Bell, Shield, HelpCircle, Sparkles, Moon, Briefcase } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/navigation/BottomNav';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/design-system/cn';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripCount, setTripCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setUser({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    });

    // Get trip count
    const { count } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setTripCount(count || 0);
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <Screen className="flex items-center justify-center pb-24">
        <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <BottomNav />
      </Screen>
    );
  }

  const menuItems = [
    { icon: Briefcase, label: 'My Trips', value: `${tripCount} trips`, href: '/trips' },
    { icon: Bell, label: 'Notifications', value: 'On', href: '#' },
    { icon: Moon, label: 'Appearance', value: 'Dark', href: '#' },
    { icon: Shield, label: 'Privacy', href: '#' },
    { icon: HelpCircle, label: 'Help & Support', href: '#' },
  ];

  return (
    <Screen className="pb-24">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <button 
            onClick={() => router.back()} 
            className="w-11 h-11 rounded-2xl bg-dark-elevated flex items-center justify-center hover:bg-dark-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Profile</h1>
          <div className="w-11" />
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Profile Card */}
        <Card variant="elevated" padding="lg" className="relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/20 rounded-full blur-3xl" />
          
          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-primary-400 flex items-center justify-center shadow-glow">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-dark-primary">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-text-primary">
                {user?.full_name || 'Traveler'}
              </h2>
              <p className="text-text-secondary text-sm flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border-subtle">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-primary-400">{tripCount}</p>
              <p className="text-xs text-text-tertiary">Trips</p>
            </div>
            <div className="w-px h-10 bg-border-subtle" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-gold-400">0</p>
              <p className="text-xs text-text-tertiary">Countries</p>
            </div>
            <div className="w-px h-10 bg-border-subtle" />
            <div className="flex-1 text-center">
              <Badge variant="gold">Free</Badge>
              <p className="text-xs text-text-tertiary mt-1">Plan</p>
            </div>
          </div>
        </Card>

        {/* Menu */}
        <Card variant="default" padding="none">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => item.href !== '#' && router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-4 px-4 py-4 hover:bg-dark-elevated transition-colors',
                index !== menuItems.length - 1 && 'border-b border-border-subtle'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-dark-elevated flex items-center justify-center">
                <item.icon className="w-5 h-5 text-text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-text-primary">{item.label}</p>
              </div>
              {item.value && (
                <span className="text-sm text-text-tertiary">{item.value}</span>
              )}
              <ChevronRight className="w-5 h-5 text-text-tertiary" />
            </button>
          ))}
        </Card>

        {/* Upgrade Card */}
        <Card variant="elevated" padding="lg" className="relative overflow-hidden border-gold-400/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/20 rounded-full blur-2xl" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gold-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary">Upgrade to Pro</h3>
              <p className="text-sm text-text-secondary">Unlimited trips, priority support</p>
            </div>
            <Badge variant="gold">Coming Soon</Badge>
          </div>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          size="lg" 
          fullWidth 
          onClick={handleLogout}
          loading={loggingOut}
          icon={<LogOut className="w-5 h-5" />}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Sign Out
        </Button>

        {/* Version */}
        <p className="text-center text-text-tertiary text-xs">
          JourneyAI v1.0.0 • Made with ❤️ in India
        </p>
      </div>

      <BottomNav />
    </Screen>
  );
}
