'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/design-system/cn';
import { useCallback, useTransition } from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'explore', label: 'Explore', icon: Compass, href: '/explore' },
  { id: 'trips', label: 'Trips', icon: Briefcase, href: '/trips' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);

  const handleNavigation = useCallback((href: string) => {
    startTransition(() => {
      router.push(href);
    });
  }, [router]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-secondary/95 backdrop-blur-xl border-t border-border-subtle safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2',
                'active:scale-95 transition-transform duration-100',
                isPending && 'opacity-70'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                active
                  ? 'bg-primary-400 shadow-glow-sm'
                  : 'bg-transparent'
              )}>
                <Icon className={cn(
                  'w-5 h-5',
                  active ? 'text-dark-primary' : 'text-text-tertiary'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium mt-0.5 truncate max-w-full',
                active ? 'text-primary-400' : 'text-text-tertiary'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iPhone */}
      <div className="h-safe-bottom bg-dark-secondary" />
    </nav>
  );
}
