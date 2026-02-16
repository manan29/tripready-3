'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Settings,
  HelpCircle,
  Star,
  LogOut,
  ChevronRight,
  Loader2,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalTrips: 0, countries: 0, upcomingTrips: 0 })
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      router.push('/')
      return
    }

    setUser(authUser)

    // Fetch user stats
    const { data: trips } = await supabase.from('trips').select('*').eq('user_id', authUser.id)

    if (trips) {
      const countries = new Set(trips.map((t) => t.country)).size
      const upcoming = trips.filter((t) => new Date(t.start_date) > new Date()).length

      setStats({
        totalTrips: trips.length,
        countries,
        upcomingTrips: upcoming,
      })
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const menuItems = [
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      onClick: () => {},
      disabled: true,
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help & Support',
      onClick: () => {},
      disabled: true,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Rate JourneyAI',
      onClick: () => {},
      disabled: true,
    },
    {
      icon: <LogOut className="w-5 h-5" />,
      label: 'Sign Out',
      onClick: handleSignOut,
      danger: true,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-100 to-transparent px-5 pt-6 pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* User Info Card */}
        <GlassCard className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {user?.user_metadata?.name || 'Traveler'}
          </h2>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <Mail className="w-4 h-4" />
            {user?.email}
          </p>
        </GlassCard>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="text-center" padding="sm">
            <p className="text-2xl font-bold text-purple-600">{stats.totalTrips}</p>
            <p className="text-xs text-gray-500 mt-1">Total Trips</p>
          </GlassCard>
          <GlassCard className="text-center" padding="sm">
            <p className="text-2xl font-bold text-purple-600">{stats.countries}</p>
            <p className="text-xs text-gray-500 mt-1">Countries</p>
          </GlassCard>
          <GlassCard className="text-center" padding="sm">
            <p className="text-2xl font-bold text-purple-600">{stats.upcomingTrips}</p>
            <p className="text-xs text-gray-500 mt-1">Upcoming</p>
          </GlassCard>
        </div>
      </div>

      {/* Account Details */}
      <div className="px-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Account Details
        </h3>
        <GlassCard>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">User ID:</span>
              <span className="text-gray-900 font-mono text-xs">{user?.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Member since:</span>
              <span className="text-gray-900">
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Menu Items */}
      <div className="px-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Menu</h3>
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <GlassCard
              key={idx}
              onClick={item.disabled ? undefined : item.onClick}
              className={item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={item.danger ? 'text-red-500' : 'text-gray-600'}>{item.icon}</div>
                  <span className={`font-medium ${item.danger ? 'text-red-500' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                  {item.disabled && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                {item.label === 'Sign Out' ? (
                  signingOut ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* App Version */}
      <div className="px-5 mt-8 text-center">
        <p className="text-xs text-gray-400">JourneyAI v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Made with ❤️ for travelers</p>
      </div>
    </div>
  )
}
