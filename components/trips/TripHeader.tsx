'use client'

import { useEffect, useState } from 'react'
import { Sun, DollarSign, Loader2 } from 'lucide-react'

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

interface TripHeaderProps {
  destination: string
  country: string
  startDate: string
  endDate: string
  currency: string
}

// Currency mapping by country
const currencyByCountry: Record<string, string> = {
  UAE: 'AED',
  Singapore: 'SGD',
  Thailand: 'THB',
  Malaysia: 'MYR',
  Indonesia: 'IDR',
  Vietnam: 'VND',
  Philippines: 'PHP',
  Maldives: 'MVR',
  'Sri Lanka': 'LKR',
  USA: 'USD',
  UK: 'GBP',
  Europe: 'EUR',
  France: 'EUR',
  Germany: 'EUR',
  Italy: 'EUR',
  Spain: 'EUR',
  Japan: 'JPY',
  China: 'CNY',
  'South Korea': 'KRW',
  Australia: 'AUD',
  'New Zealand': 'NZD',
  Canada: 'CAD',
  Switzerland: 'CHF',
  Turkey: 'TRY',
  Egypt: 'EGP',
  'South Africa': 'ZAR',
  Brazil: 'BRL',
  Mexico: 'MXN',
  India: 'INR',
}

export default function TripHeader({
  destination,
  country,
  startDate,
  endDate,
  currency,
}: TripHeaderProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currencyRate, setCurrencyRate] = useState<CurrencyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch weather
        const weatherRes = await fetch(`/api/weather?city=${encodeURIComponent(destination)}`)
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json()
          setWeather(weatherData)
        }

        // Determine destination currency from country
        const destinationCurrency = currencyByCountry[country] || currency || 'USD'

        // Fetch currency (from destination currency to INR)
        const currencyRes = await fetch(
          `/api/currency?from=${destinationCurrency}&to=INR`
        )
        if (currencyRes.ok) {
          const currencyData = await currencyRes.json()
          setCurrencyRate(currencyData)
        }
      } catch (error) {
        console.error('Error fetching live data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (destination && destination !== 'Unknown') {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [destination, country, currency])

  const daysUntil = (date: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const tripDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const days = daysUntil(startDate)
  const duration = tripDuration(startDate, endDate)

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Trip Info */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {destination}
              {country && <span className="text-gray-500 text-lg md:text-xl ml-2">{country}</span>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {days < 0 ? (
                <span className="text-gray-600 font-medium">Trip completed</span>
              ) : days === 0 ? (
                <span className="text-primary font-medium">Trip starts today! 🎉</span>
              ) : (
                <>
                  <span className="font-medium text-primary">
                    {days === 1 ? '1 day to go' : `${days} days to go`}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{duration === 1 ? '1 day trip' : `${duration} days trip`}</span>
                </>
              )}
            </p>
          </div>

          {/* Right: Weather & Currency */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Weather */}
            <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2">
              <Sun className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <p className="text-xs text-gray-600">Weather</p>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
                ) : weather ? (
                  <p className="text-sm font-semibold text-gray-900">{weather.temp}°C</p>
                ) : (
                  <p className="text-sm text-gray-400">--</p>
                )}
              </div>
            </div>

            {/* Currency */}
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="text-xs text-gray-600">Currency</p>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                ) : currencyRate ? (
                  <p className="text-xs font-semibold text-gray-900">
                    1 {currencyRate.from} = ₹{currencyRate.rate.toFixed(1)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">--</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
