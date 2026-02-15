'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Sun, DollarSign, ArrowLeft, Loader2, Plus, Minus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SignupModal from '@/components/SignupModal'
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

function TripNewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Parse URL params
  const urlDestination = searchParams.get('destination') || 'Unknown'
  const urlCountry = searchParams.get('country') || ''
  const duration = parseInt(searchParams.get('duration') || '5')
  const tripType = searchParams.get('tripType') || 'adventure'

  // Editable state
  const [destination, setDestination] = useState(urlDestination)
  const [country, setCountry] = useState(urlCountry)
  const [numAdults, setNumAdults] = useState(parseInt(searchParams.get('numAdults') || '2'))
  const [numKids, setNumKids] = useState(parseInt(searchParams.get('numKids') || '0'))
  const [startDate, setStartDate] = useState('')

  // Calculate end date based on start date + duration
  const calculateEndDate = (start: string, days: number) => {
    if (!start) return ''
    const date = new Date(start)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const endDate = calculateEndDate(startDate, duration)

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currency, setCurrency] = useState<CurrencyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Only fetch if we have a valid destination
        if (destination && destination !== 'Unknown') {
          // Fetch weather
          console.log('Fetching weather for:', destination)
          const weatherRes = await fetch(`/api/weather?city=${encodeURIComponent(destination)}`)
          if (weatherRes.ok) {
            const weatherData = await weatherRes.json()
            setWeather(weatherData)
          } else {
            console.error('Weather API failed:', await weatherRes.text())
          }

          // Fetch currency (assuming USD to INR for now)
          const currencyRes = await fetch('/api/currency?from=USD&to=INR')
          if (currencyRes.ok) {
            const currencyData = await currencyRes.json()
            setCurrency(currencyData)
          } else {
            console.error('Currency API failed:', await currencyRes.text())
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [destination])

  const handleSaveTrip = async () => {
    // Check if user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      console.log('No user session found')
      setShowSignupModal(true)
      return
    }

    // Validate required fields
    if (!startDate) {
      alert('Please select a start date')
      return
    }

    if (!destination || destination === 'Unknown') {
      alert('Please enter a valid destination')
      return
    }

    setIsSaving(true)

    try {
      console.log('Saving trip with data:', {
        user_id: session.user.id,
        destination,
        country,
        start_date: startDate,
        end_date: endDate,
        adults: numAdults,
        kids: numKids,
      })

      // 1. Save trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: session.user.id,
          destination: destination,
          country: country,
          start_date: startDate,
          end_date: endDate,
          adults: numAdults,
          kids: numKids,
          destination_currency: 'INR',
        })
        .select()
        .single()

      if (tripError) {
        console.error('Supabase error:', tripError)
        alert(`Failed to save trip: ${tripError.message}`)
        setIsSaving(false)
        return
      }

      console.log('Trip saved successfully:', trip)

      // 2. Generate packing list
      try {
        const packingResponse = await fetch('/api/ai/packing-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination,
            duration,
            numAdults,
            numKids,
            weather: weather?.description || 'unknown',
          }),
        })

        if (packingResponse.ok) {
          const packingData = await packingResponse.json()

          // 3. Insert packing items
          const packingItems = packingData.categories.flatMap((cat: any) =>
            cat.items.map((item: string, index: number) => ({
              trip_id: trip.id,
              user_id: session.user.id,
              category: cat.name,
              title: item,
              is_packed: false,
              sort_order: index,
            }))
          )

          if (packingItems.length > 0) {
            const { error: packingError } = await supabase
              .from('packing_items')
              .insert(packingItems)

            if (packingError) {
              console.error('Error saving packing items:', packingError)
            }
          }
        } else {
          console.error('Failed to generate packing list:', await packingResponse.text())
        }
      } catch (packingError) {
        console.error('Packing list error:', packingError)
        // Continue even if packing list fails
      }

      // 4. Redirect to trip detail page
      router.push(`/trips/${trip.id}`)
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Error saving trip: ${error?.message || 'Unknown error'}`)
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
            <div className="mb-6">
              <div className="mb-4">
                {destination === 'Unknown' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination City *
                      </label>
                      <input
                        type="text"
                        value={destination === 'Unknown' ? '' : destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Dubai, Singapore, Bangkok"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country (Optional)
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., UAE, Singapore, Thailand"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {destination}
                      {country && <span className="text-gray-500 text-2xl ml-2">{country}</span>}
                    </h1>
                    <button
                      onClick={() => setDestination('Unknown')}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit destination
                    </button>
                  </>
                )}
              </div>
              <div className="inline-block px-3 py-1 bg-purple-100 text-primary rounded-full text-sm font-medium capitalize">
                {tripType} Trip
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

              {/* Travelers - Editable */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Travelers</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-16">Adults:</span>
                      <button
                        onClick={() => setNumAdults(Math.max(1, numAdults - 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{numAdults}</span>
                      <button
                        onClick={() => setNumAdults(Math.min(10, numAdults + 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-16">Kids:</span>
                      <button
                        onClick={() => setNumKids(Math.max(0, numKids - 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{numKids}</span>
                      <button
                        onClick={() => setNumKids(Math.min(6, numKids + 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates - Editable */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Start Date</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  {endDate && (
                    <p className="text-xs text-gray-500 mt-1">End: {endDate}</p>
                  )}
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
                disabled={isSaving || !startDate}
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
              We'll generate a smart packing list based on your destination and travelers
            </p>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        redirectUrl={`/trips/new?${searchParams.toString()}`}
      />
    </div>
  )
}

export default function NewTripPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <TripNewContent />
    </Suspense>
  )
}
