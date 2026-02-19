'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowLeft } from 'lucide-react'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'
import { getCurrencyForCountry } from '@/lib/destinations'
import { getTripStage, getDefaultStageData } from '@/lib/trip-stages'
import { PreTripView } from '@/components/trips/stages/PreTripView'
import { DuringTripView } from '@/components/trips/stages/DuringTripView'
import { PostTripView } from '@/components/trips/stages/PostTripView'
import { FlightsStep } from '@/components/trips/stages/steps/FlightsStep'
import { HotelsStep } from '@/components/trips/stages/steps/HotelsStep'
import { VisaDocsStep } from '@/components/trips/stages/steps/VisaDocsStep'
import { PackingStep } from '@/components/trips/stages/steps/PackingStep'
import { LastMinuteStep } from '@/components/trips/stages/steps/LastMinuteStep'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [trip, setTrip] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [currency, setCurrency] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stageData, setStageData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)

  // Lift packing list state to parent to persist across tab switches
  const [kidsPackingList, setKidsPackingList] = useState<any[]>([])
  const [adultPackingList, setAdultPackingList] = useState<any[]>([])

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

    // Initialize stage data if not present
    if (!tripData.stage_data) {
      setStageData(getDefaultStageData())
    } else {
      setStageData(tripData.stage_data)
    }

    // Fetch weather forecast for trip dates with insights
    try {
      const weatherRes = await fetch(
        `/api/weather?city=${tripData.destination}&start_date=${tripData.start_date}&end_date=${tripData.end_date}`
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

  const handleUpdateStageData = async (newData: any) => {
    setStageData(newData)
    setCurrentStep(null) // Close step view

    // Save to database
    try {
      await supabase
        .from('trips')
        .update({ stage_data: newData })
        .eq('id', tripId)
    } catch (error) {
      console.error('Error updating stage data:', error)
    }
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
        <p className="text-[#64748B]">Trip not found</p>
      </div>
    )
  }

  const stage = getTripStage(trip.start_date, trip.end_date)

  // If viewing a step detail, show that instead
  if (currentStep) {
    const stepProps = {
      trip,
      tripId,
      stageData,
      onBack: () => setCurrentStep(null),
      onComplete: handleUpdateStageData,
    }

    return (
      <div className="min-h-screen pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentStep === 'flights' && <FlightsStep {...stepProps} />}
          {currentStep === 'hotels' && <HotelsStep {...stepProps} />}
          {currentStep === 'visa-docs' && <VisaDocsStep {...stepProps} />}
          {currentStep === 'packing' && (
            <PackingStep
              {...stepProps}
              kidsPackingList={kidsPackingList}
              adultPackingList={adultPackingList}
              setKidsPackingList={setKidsPackingList}
              setAdultPackingList={setAdultPackingList}
            />
          )}
          {currentStep === 'last-minute' && <LastMinuteStep {...stepProps} />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Back Button */}
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#1E293B] mb-4 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">Back</span>
          </button>

          {/* Destination */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl lg:text-6xl">{getDestinationEmoji()}</span>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{trip.destination}</h1>
                <p className="text-[#64748B] text-sm md:text-base">{trip.country}</p>
              </div>
            </div>

            {/* Stage Indicator */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${stage === 'pre-trip' ? 'bg-purple-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${stage === 'during-trip' ? 'bg-purple-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${stage === 'post-trip' ? 'bg-purple-500' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* Date Range */}
          <p className="text-[#64748B] text-sm md:text-base mb-6">
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

          {/* Stats Cards - Only show for pre-trip and during-trip */}
          {stage !== 'post-trip' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Days to Go */}
              <GlassCard className="text-center">
                <p className="text-purple-600 font-bold text-lg">{getDaysToGo()}</p>
                <p className="text-[#64748B] text-xs">
                  {new Date(trip.start_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </GlassCard>

              {/* Duration */}
              <GlassCard className="text-center">
                <p className="text-[#1E293B] font-bold text-lg">{getTripDuration()}</p>
                <p className="text-[#64748B] text-xs">Duration</p>
              </GlassCard>

              {/* Weather */}
              <GlassCard className="text-center">
                {weather?.hasInsights ? (
                  <>
                    <p className="text-orange-500 font-bold text-lg flex items-center justify-center gap-1">
                      <span>{weather.icon}</span>
                      <span>
                        {weather.tempMin}-{weather.tempMax}°C
                      </span>
                    </p>
                    <p className="text-gray-700 text-[11px] font-medium mt-1 leading-tight">{weather.insight}</p>
                    {weather.packingTip && (
                      <p className="text-[#64748B] text-[10px] mt-1.5 leading-tight">📦 {weather.packingTip}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-orange-500 font-bold text-lg">
                      {weather ? `${weather.temp}°C` : '—'}
                      {weather && <span className="ml-1">☀️</span>}
                    </p>
                    <p className="text-[#64748B] text-xs">
                      {weather?.description || 'Weather'}
                      {weather?.context && (
                        <span className="block text-[10px] text-[#94A3B8] mt-0.5">{weather.context}</span>
                      )}
                    </p>
                  </>
                )}
              </GlassCard>

              {/* Currency */}
              <GlassCard className="text-center">
                <p className="text-green-600 font-bold text-lg">{currency ? `₹${currency.rate?.toFixed(2)}` : '—'}</p>
                <p className="text-[#64748B] text-xs">{currency ? `1 ${currency.from} = INR` : 'Currency'}</p>
              </GlassCard>
            </div>
          )}

          {/* WhatsApp Share Button - Only show for pre-trip */}
          {stage === 'pre-trip' && (
            <div className="mt-4">
              <WhatsAppShareButton
                trip={{
                  destination: trip.destination,
                  country: trip.country,
                  startDate: trip.start_date,
                  endDate: trip.end_date,
                  numAdults: trip.num_adults || 2,
                  numKids: trip.num_kids || 0,
                  kidAges: trip.kid_ages,
                }}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Stage-Based Content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {stage === 'pre-trip' && (
            <PreTripView
              trip={trip}
              stageData={stageData}
              onUpdateStageData={handleUpdateStageData}
              onOpenStep={setCurrentStep}
            />
          )}
          {stage === 'during-trip' && (
            <DuringTripView
              trip={trip}
              stageData={stageData}
              weather={weather}
              onUpdateStageData={handleUpdateStageData}
            />
          )}
          {stage === 'post-trip' && (
            <PostTripView
              trip={trip}
              stageData={stageData}
              onUpdateStageData={handleUpdateStageData}
            />
          )}
        </div>
      </div>
    </div>
  )
}
