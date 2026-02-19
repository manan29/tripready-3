'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, User, Plane } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showBookings, setShowBookings] = useState(false)
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

  // Check if we should show Bookings tab based on current trip
  useEffect(() => {
    const checkBookingsVisibility = async () => {
      // Extract trip ID from pathname if we're on a trip page
      const tripMatch = pathname.match(/\/trips\/([^\/]+)/)
      if (!tripMatch) {
        setShowBookings(false)
        return
      }

      const tripId = tripMatch[1]
      const { data: trip } = await supabase
        .from('trips')
        .select('stage_data')
        .eq('id', tripId)
        .single()

      if (trip?.stage_data?.['pre-trip']?.['visa-docs']?.completed) {
        setShowBookings(true)
      } else {
        setShowBookings(false)
      }
    }

    checkBookingsVisibility()
  }, [pathname])

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ClipboardList, label: 'My Trips', href: isLoggedIn ? '/trips' : '/login' },
    ...(showBookings ? [{ icon: Plane, label: 'Bookings', href: '/bookings' }] : []),
    { icon: User, label: 'Profile', href: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-7xl mx-auto flex items-center justify-around px-4 md:px-8 py-2">
        {navItems.map((item) => (
          <NavButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={
              pathname === item.href ||
              (item.href === '/trips' && pathname.startsWith('/trips/')) ||
              (item.href === '/profile' && pathname.startsWith('/profile')) ||
              (item.href === '/bookings' && pathname.startsWith('/bookings'))
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
      className="flex flex-col items-center justify-center gap-1 py-2 px-4 md:px-6 min-w-[80px] md:min-w-[100px]"
    >
      <Icon className={`w-6 h-6 md:w-7 md:h-7 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
      <span className={`text-xs md:text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
        {label}
      </span>
    </Link>
  )
}
