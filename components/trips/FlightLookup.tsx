'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plane, Search, Loader2, X } from 'lucide-react'

interface FlightData {
  airline: string
  flightNumber: string
  departure: {
    airport: string
    iata: string
    time: string
    terminal: string
  }
  arrival: {
    airport: string
    iata: string
    time: string
    terminal: string
  }
  status: string
}

interface FlightLookupProps {
  tripId: string
  onFlightAdded: () => void
  onClose: () => void
}

export default function FlightLookup({ tripId, onFlightAdded, onClose }: FlightLookupProps) {
  const [flightNumber, setFlightNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [flightData, setFlightData] = useState<FlightData | null>(null)
  const [pnr, setPnr] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleFetchFlight = async () => {
    if (!flightNumber.trim()) {
      setError('Please enter a flight number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/flights?flight=${encodeURIComponent(flightNumber)}`)

      if (!response.ok) {
        const errorData = await response.json()
        setError(
          errorData.error ||
            'Flight not found. Please check the flight number or enter details manually.'
        )
        setLoading(false)
        return
      }

      const data = await response.json()
      setFlightData(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching flight:', error)
      setError('Unable to connect to flight service. Please try again or enter details manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFlight = async () => {
    if (!flightData) return

    setSaving(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert('You must be logged in to save flights')
        return
      }

      // Save to bookings table
      const { error } = await supabase.from('bookings').insert({
        trip_id: tripId,
        user_id: session.user.id,
        type: 'flight',
        title: `${flightData.airline} ${flightData.flightNumber}`,
        details: {
          airline: flightData.airline,
          flightNumber: flightData.flightNumber,
          departure: flightData.departure,
          arrival: flightData.arrival,
          pnr: pnr || null,
          seatNumber: seatNumber || null,
        },
        booking_date: new Date().toISOString().split('T')[0],
      })

      if (error) {
        console.error('Error saving flight:', error)
        alert('Failed to save flight. Please try again.')
        return
      }

      onFlightAdded()
      onClose()
    } catch (error) {
      console.error('Error saving flight:', error)
      alert('Failed to save flight. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Flight</h2>
            <p className="text-sm text-gray-600">Enter flight number to auto-fill details</p>
          </div>
        </div>

        {/* Flight Number Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flight Number (e.g., EK524, AI101)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder="EK524"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading || !!flightData}
            />
            {!flightData && (
              <button
                onClick={handleFetchFlight}
                disabled={loading}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Fetch Details
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Flight Not Found</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Flight Details */}
        {flightData && (
          <div className="space-y-4 mb-6">
            {/* Flight Info Card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Airline</p>
                  <p className="font-semibold text-gray-900">{flightData.airline}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Flight Number</p>
                  <p className="font-semibold text-gray-900">{flightData.flightNumber}</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Departure</p>
                  <p className="font-bold text-lg text-gray-900">{flightData.departure.iata}</p>
                  <p className="text-sm text-gray-600">{flightData.departure.airport}</p>
                  {flightData.departure.time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(flightData.departure.time).toLocaleString()}
                    </p>
                  )}
                  {flightData.departure.terminal && (
                    <p className="text-xs text-gray-500">
                      Terminal {flightData.departure.terminal}
                    </p>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="border-t-2 border-dashed border-gray-300 w-16" />
                  <Plane className="h-5 w-5 text-primary mx-2" />
                  <div className="border-t-2 border-dashed border-gray-300 w-16" />
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Arrival</p>
                  <p className="font-bold text-lg text-gray-900">{flightData.arrival.iata}</p>
                  <p className="text-sm text-gray-600">{flightData.arrival.airport}</p>
                  {flightData.arrival.time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(flightData.arrival.time).toLocaleString()}
                    </p>
                  )}
                  {flightData.arrival.terminal && (
                    <p className="text-xs text-gray-500">Terminal {flightData.arrival.terminal}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PNR Number (Optional)
                </label>
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seat Number (Optional)
                </label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
                  placeholder="12A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveFlight}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Flight'
                )}
              </button>
              <button
                onClick={() => setFlightData(null)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-colors"
              >
                Try Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
