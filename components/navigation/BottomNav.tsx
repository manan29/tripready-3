'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/design-system/cn';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'explore', label: 'Explore', icon: Compass, href: '/explore' },
  { id: 'trips', label: 'Trips', icon: Briefcase, href: '/trips' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-secondary/95 backdrop-blur-xl border-t border-border-default">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto pb-safe">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center w-16 h-full active:scale-95 transition-transform"
            >
              <div className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300',
                active
                  ? 'bg-primary-400 shadow-glow'
                  : 'bg-transparent hover:bg-dark-elevated'
              )}>
                <Icon className={cn(
                  'w-5 h-5 transition-colors duration-300',
                  active ? 'text-dark-primary' : 'text-text-tertiary'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-semibold mt-1 transition-colors duration-300',
                active ? 'text-primary-400' : 'text-text-tertiary'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
