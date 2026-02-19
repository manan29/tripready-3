'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ClipboardList, label: 'My Trips', href: isLoggedIn ? '/trips' : '/login' },
    { icon: User, label: 'Profile', href: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => (
          <NavButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={
              pathname === item.href ||
              (item.href === '/trips' && pathname.startsWith('/trips/')) ||
              (item.href === '/profile' && pathname.startsWith('/profile'))
            }
          />
        ))}
      </div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  href,
  isActive,
}: {
  icon: any
  label: string
  href: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[80px]"
    >
      <Icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
      <span className={`text-xs font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
        {label}
      </span>
    </Link>
  )
}
