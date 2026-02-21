'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, ClipboardList, FileText, User } from 'lucide-react';

interface BottomNavProps {
  showBookings?: boolean;
}

export function BottomNav({ showBookings = false }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ClipboardList, label: 'My Trips', href: '/trips' },
    ...(showBookings ? [{ icon: FileText, label: 'Bookings', href: '/bookings' }] : []),
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-6 py-2 pb-[max(8px,env(safe-area-inset-bottom))] z-50">
      <div className="max-w-[430px] mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 py-2 px-4 ${
                isActive ? 'text-[#0A7A6E]' : 'text-[#9CA3AF]'
              }`}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
