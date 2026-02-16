'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { ExpandableSection } from '@/components/ui/ExpandableSection'
import {
  ArrowLeft,
  Calendar,
  Users,
  Cloud,
  DollarSign,
  CheckSquare,
  Plane,
  FileText,
  Wallet,
  MapPin,
  Clock,
  Baby,
} from 'lucide-react'

// Import section components
import KidsSection from '@/components/trips/sections/KidsSection'
import PackingSection from '@/components/trips/sections/PackingSection'
import BookingsSection from '@/components/trips/sections/BookingsSection'
import DocumentsSection from '@/components/trips/sections/DocumentsSection'
import BudgetSection from '@/components/trips/sections/BudgetSection'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'
import { getCurrencyForCountry } from '@/lib/destinations'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [trip, setTrip] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [currency, setCurrency] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTripData()
  }, [tripId])

  const fetchTripData = async () => {
    setLoading(true)

    // Fetch trip
    const { data: tripData, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single()

    if (error || !tripData) {
      console.error('Error fetching trip:', error)
      router.push('/trips')
      return
    }

    setTrip(tripData)

    // Fetch weather forecast for trip dates
    try {
      const weatherRes = await fetch(
        `/api/weather?city=${tripData.destination}&start_date=${tripData.start_date}`
      )
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json()
        setWeather(weatherData)
      }
    } catch (e) {
      console.error('Weather fetch error:', e)
    }

    // Fetch currency - use local destination currency
    try {
      const fromCurrency = getCurrencyForCountry(tripData.country)

      const currencyRes = await fetch(`/api/currency?from=${fromCurrency}&to=INR`)
      if (currencyRes.ok) {
        const currencyData = await currencyRes.json()
        setCurrency({ ...currencyData, from: fromCurrency })
      }
    } catch (e) {
      console.error('Currency fetch error:', e)
    }

    setLoading(false)
  }

  const getDaysToGo = () => {
    if (!trip?.start_date) return null
    const start = new Date(trip.start_date)
    const today = new Date()
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) {
      const end = new Date(trip.end_date)
      if (today <= end) return 'Ongoing'
      return 'Completed'
    }
    if (diff === 0) return 'Today!'
    if (diff === 1) return '1 day to go'
    return `${diff} days to go`
  }

  const getTripDuration = () => {
    if (!trip?.start_date || !trip?.end_date) return '—'
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return `${days} days`
  }

  const getDestinationEmoji = () => {
    const emojiMap: Record<string, string> = {
      dubai: '☀️',
      thailand: '🌴',
      singapore: '🏙️',
      bali: '🏝️',
      malaysia: '🦜',
      maldives: '🐚',
      japan: '🗾',
      india: '🇮🇳',
    }
    return emojiMap[trip?.destination?.toLowerCase()] || '✈️'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Trip not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-100 to-transparent px-5 pt-6 pb-8">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        {/* Destination */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{getDestinationEmoji()}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.destination}</h1>
            <p className="text-gray-500">{trip.country}</p>
          </div>
        </div>

        {/* Date Range */}
        <p className="text-gray-500 text-sm mb-6">
          {new Date(trip.start_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}
          {' - '}
          {new Date(trip.end_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Days to Go */}
          <GlassCard className="text-center">
            <p className="text-purple-600 font-bold text-lg">{getDaysToGo()}</p>
            <p className="text-gray-500 text-xs">
              {new Date(trip.start_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </GlassCard>

          {/* Duration */}
          <GlassCard className="text-center">
            <p className="text-gray-800 font-bold text-lg">{getTripDuration()}</p>
            <p className="text-gray-500 text-xs">Duration</p>
          </GlassCard>

          {/* Weather */}
          <GlassCard className="text-center">
            <p className="text-orange-500 font-bold text-lg">
              {weather ? `${weather.temp}°C` : '—'}
              {weather && <span className="ml-1">☀️</span>}
            </p>
            <p className="text-gray-500 text-xs">
              {weather?.description || 'Weather'}
              {weather?.context && (
                <span className="block text-[10px] text-gray-400 mt-0.5">
                  {weather.context}
                </span>
              )}
            </p>
          </GlassCard>

          {/* Currency */}
          <GlassCard className="text-center">
            <p className="text-green-600 font-bold text-lg">
              {currency ? `₹${currency.rate?.toFixed(2)}` : '—'}
            </p>
            <p className="text-gray-500 text-xs">
              {currency ? `1 ${currency.from} = INR` : 'Currency'}
            </p>
          </GlassCard>
        </div>

        {/* WhatsApp Share Button */}
        <div className="px-5 mt-4">
          <WhatsAppShareButton
            trip={{
              destination: trip.destination,
              country: trip.country,
              startDate: trip.start_date,
              endDate: trip.end_date,
              numAdults: trip.num_adults || 2,
              numKids: trip.num_kids || trip.kids || 0,
              kidAges: trip.kid_ages,
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-5 space-y-4">
        {/* Kids Essentials - THE MAGIC MOMENT (Show first if kids present) */}
        {(trip.num_kids > 0 || trip.kids > 0) && (
          <ExpandableSection
            title="Kids Essentials"
            icon={<Baby className="w-4 h-4" />}
            iconColor="grape"
            defaultExpanded={true}
          >
            <KidsSection
              tripId={tripId}
              numKids={trip.kids || trip.num_kids || 0}
              kidAges={trip.kid_ages}
            />
          </ExpandableSection>
        )}

        {/* Packing List */}
        <ExpandableSection
          title="Packing List"
          icon={<CheckSquare className="w-4 h-4" />}
          iconColor="lavender"
          defaultExpanded={!trip.num_kids && !trip.kids}
        >
          <PackingSection
            tripId={tripId}
            destination={trip.destination}
            numKids={trip.kids || trip.num_kids || 0}
            kidAges={trip.kid_ages}
          />
        </ExpandableSection>

        {/* Bookings */}
        <ExpandableSection
          title="Bookings"
          icon={<Plane className="w-4 h-4" />}
          iconColor="plum"
        >
          <BookingsSection tripId={tripId} />
        </ExpandableSection>

        {/* Documents */}
        <ExpandableSection
          title="Documents"
          icon={<FileText className="w-4 h-4" />}
          iconColor="grape"
        >
          <DocumentsSection tripId={tripId} />
        </ExpandableSection>

        {/* Budget */}
        <ExpandableSection title="Budget" icon={<Wallet className="w-4 h-4" />} iconColor="lavender">
          <BudgetSection tripId={tripId} currency={currency} />
        </ExpandableSection>
      </div>
    </div>
  )
}
