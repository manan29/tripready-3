'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Plus, ClipboardList, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: ClipboardList, label: 'Trips', href: '/trips' },
    { icon: User, label: 'Profile', href: '/profile' },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-full shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_10px_15px_rgba(0,0,0,0.1)] px-3 py-2 flex items-center gap-1">
        {/* First two nav items */}
        {navItems.slice(0, 2).map((item) => (
          <NavButton
            key={item.href}
            icon={item.icon}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}

        {/* Center FAB */}
        <Link
          href="/trips/new"
          className="w-14 h-14 bg-[#9B8ABF] rounded-full flex items-center justify-center shadow-[0px_4px_6px_rgba(216,180,254,0.4),0px_10px_15px_rgba(216,180,254,0.4)] -mt-6 mx-2"
        >
          <Plus className="w-6 h-6 text-white" />
        </Link>

        {/* Last two nav items */}
        {navItems.slice(2).map((item) => (
          <NavButton
            key={item.href}
            icon={item.icon}
            href={item.href}
            isActive={pathname === item.href || (item.href === '/trips' && pathname.startsWith('/trips/'))}
          />
        ))}
      </div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  href,
  isActive,
}: {
  icon: any
  href: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        isActive ? 'bg-[#9B8ABF] text-white' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon className="w-5 h-5" />
    </Link>
  )
}
