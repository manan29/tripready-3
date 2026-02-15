'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Sun, DollarSign, ArrowLeft, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

interface WeatherData {
  temp: number
  description: string
  icon: string
}

interface CurrencyData {
  from: string
  to: string
  rate: number
}

export default function NewTripPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Parse URL params
  const destination = searchParams.get('destination') || 'Unknown'
  const country = searchParams.get('country') || ''
  const duration = parseInt(searchParams.get('duration') || '5')
  const numAdults = parseInt(searchParams.get('numAdults') || '2')
  const numKids = parseInt(searchParams.get('numKids') || '0')
  const tripType = searchParams.get('tripType') || 'adventure'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currency, setCurrency] = useState<CurrencyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch weather
        const weatherRes = await fetch(`/api/weather?city=${encodeURIComponent(destination)}`)
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json()
          setWeather(weatherData)
        }

        // Fetch currency (assuming USD to INR for now)
        const currencyRes = await fetch('/api/currency?from=USD&to=INR')
        if (currencyRes.ok) {
          const currencyData = await currencyRes.json()
          setCurrency(currencyData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (destination && destination !== 'Unknown') {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [destination])

  const handleSaveTrip = async () => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Redirect to login
      router.push('/login?redirect=/trips/new?' + searchParams.toString())
      return
    }

    setIsSaving(true)
    try {
      // TODO: Save trip to database
      // For now, just redirect to trips page
      router.push('/trips')
    } catch (error) {
      console.error('Error saving trip:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </button>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {destination}
                  {country && <span className="text-gray-500 text-2xl ml-2">{country}</span>}
                </h1>
                <div className="inline-block px-3 py-1 bg-purple-100 text-primary rounded-full text-sm font-medium capitalize">
                  {tripType} Trip
                </div>
              </div>
            </div>

            {/* Trip Details Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{duration} days</p>
                </div>
              </div>

              {/* Travelers */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Travelers</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {numAdults} {numAdults === 1 ? 'Adult' : 'Adults'}
                    {numKids > 0 && `, ${numKids} ${numKids === 1 ? 'Kid' : 'Kids'}`}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dates</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {startDate && endDate ? `${startDate} - ${endDate}` : 'Flexible'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather & Currency Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Weather Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Current Weather</h2>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : weather ? (
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-5xl font-bold text-gray-900">{weather.temp}°C</div>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt="Weather icon"
                      className="w-16 h-16"
                    />
                  </div>
                  <p className="text-gray-600 capitalize">{weather.description}</p>
                </div>
              ) : (
                <p className="text-gray-500">Weather data unavailable</p>
              )}
            </div>

            {/* Currency Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Currency Exchange</h2>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : currency ? (
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₹{currency.rate.toFixed(2)}
                  </div>
                  <p className="text-gray-600">
                    1 {currency.from} = {currency.rate.toFixed(2)} {currency.to}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Currency data unavailable</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSaveTrip}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Trip & Continue'
                )}
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
              >
                Start Over
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Saving this trip will allow you to add detailed itineraries, manage budgets, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
