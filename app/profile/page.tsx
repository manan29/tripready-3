'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/language'
import { calculateTotalAirMiles, formatAirMiles } from '@/lib/air-miles'
import { ProfileStatsCard } from '@/components/stats/ProfileStatsCard'
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
  Globe,
  Camera,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [stats, setStats] = useState({ totalTrips: 0, countries: 0, upcomingTrips: 0 })
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [showStatsCard, setShowStatsCard] = useState(false)
  const [statsType, setStatsType] = useState<'overall' | 'year'>('overall')
  const [statsYear, setStatsYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchUserData()
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('journeyai-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
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
    const { data: tripsData } = await supabase.from('trips').select('*').eq('user_id', authUser.id)

    if (tripsData) {
      setTrips(tripsData)
      const countries = new Set(tripsData.map((t) => t.country)).size
      const upcoming = tripsData.filter((t) => new Date(t.start_date) > new Date()).length

      setStats({
        totalTrips: tripsData.length,
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

  const handleLanguageChange = (code: string) => {
    setLanguage(code)
    localStorage.setItem('journeyai-language', code)
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-b from-purple-100 to-transparent px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Profile</h1>

          {/* User Info Card */}
          <GlassCard className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold mx-auto mb-3">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
              {user?.user_metadata?.name || 'Traveler'}
            </h2>
            <p className="text-sm md:text-base text-gray-500 flex items-center justify-center gap-1">
              <Mail className="w-4 h-4 md:w-5 md:h-5" />
              {user?.email}
            </p>
          </GlassCard>
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
            <GlassCard className="text-center" padding="sm">
              <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.totalTrips}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Total Trips</p>
            </GlassCard>
            <GlassCard className="text-center" padding="sm">
              <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.countries}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Countries</p>
            </GlassCard>
            <GlassCard className="text-center" padding="sm">
              <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.upcomingTrips}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Upcoming</p>
            </GlassCard>
          </div>
        </div>

        {/* Shareable Stats Cards */}
        {trips.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wide mb-3 max-w-2xl mx-auto flex items-center gap-2">
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
              Share Your Journey
            </h3>
            <GlassCard className="max-w-2xl mx-auto">
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Create beautiful shareable cards of your travel stats
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setStatsType('year')
                    setStatsYear(new Date().getFullYear())
                    setShowStatsCard(true)
                  }}
                  className="py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl font-medium flex flex-col items-center justify-center gap-1 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all shadow-md"
                >
                  <span className="text-xl md:text-2xl">🎊</span>
                  <span className="text-sm md:text-base">{new Date().getFullYear()} Wrapped</span>
                </button>
                <button
                  onClick={() => {
                    setStatsType('overall')
                    setShowStatsCard(true)
                  }}
                  className="py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium flex flex-col items-center justify-center gap-1 hover:from-purple-700 hover:to-pink-600 transition-all shadow-md"
                >
                  <span className="text-xl md:text-2xl">🌍</span>
                  <span className="text-sm md:text-base">All Time Stats</span>
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-500">Total Air Miles:</span>
                  <span className="font-bold text-purple-600 text-base md:text-lg">
                    {formatAirMiles(calculateTotalAirMiles(trips))}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Account Details */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wide mb-3 max-w-2xl mx-auto">
            Account Details
          </h3>
          <GlassCard className="max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm md:text-base">
                <User className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className="text-gray-500">User ID:</span>
                <span className="text-gray-900 font-mono text-xs md:text-sm">{user?.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-3 text-sm md:text-base">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
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

        {/* Language Settings */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2 max-w-2xl mx-auto">
            <Globe className="w-4 h-4 md:w-5 md:h-5" />
            Language
          </h3>
          <GlassCard className="max-w-2xl mx-auto">
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-colors ${
                  language === lang.code
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                  <div>
                    <span className="font-medium text-gray-900 text-sm md:text-base">{lang.nativeName}</span>
                    <span className="text-xs md:text-sm text-gray-500 ml-2">({lang.name})</span>
                  </div>
                  {language === lang.code && <span className="text-purple-600 text-xl md:text-2xl">✓</span>}
                </button>
              ))}
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-3 text-center">
              🚀 Sarvam AI translation coming soon for Hindi & Kannada
            </p>
          </GlassCard>
        </div>

        {/* Menu Items */}
        <div className="px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wide mb-3 max-w-2xl mx-auto">Menu</h3>
          <div className="space-y-2 max-w-2xl mx-auto">
          {menuItems.map((item, idx) => (
            <GlassCard
              key={idx}
              onClick={item.disabled ? undefined : item.onClick}
              className={item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={item.danger ? 'text-red-500' : 'text-gray-600'}>{item.icon}</div>
                    <span className={`font-medium text-sm md:text-base ${item.danger ? 'text-red-500' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                    {item.disabled && (
                      <span className="text-xs md:text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  {item.label === 'Sign Out' ? (
                    signingOut ? (
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-gray-400 animate-spin" />
                    ) : (
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                    )
                  ) : (
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* App Version */}
        <div className="px-4 sm:px-6 lg:px-8 mt-8 text-center">
          <p className="text-xs md:text-sm text-gray-400">JourneyAI v1.0.0</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Made with ❤️ for travelers</p>
        </div>

        {/* Stats Card Modal */}
        {showStatsCard && (
          <ProfileStatsCard
            trips={trips}
            user={user}
            type={statsType}
            year={statsYear}
            onClose={() => setShowStatsCard(false)}
          />
        )}
      </div>
    </div>
  )
}
