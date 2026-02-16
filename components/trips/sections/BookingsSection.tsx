'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { Plus, Plane, Building, Search, Loader2 } from 'lucide-react'

interface BookingsSectionProps {
  tripId: string
}

export default function BookingsSection({ tripId }: BookingsSectionProps) {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFlightForm, setShowFlightForm] = useState(false)
  const [showHotelForm, setShowHotelForm] = useState(false)
  const [flightNumber, setFlightNumber] = useState('')
  const [flightData, setFlightData] = useState<any>(null)
  const [fetchingFlight, setFetchingFlight] = useState(false)
  const [pnr, setPnr] = useState('')
  const [seats, setSeats] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [tripId])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })

    if (data) setBookings(data)
    setLoading(false)
  }

  const fetchFlightDetails = async () => {
    if (!flightNumber.trim()) return

    setFetchingFlight(true)
    try {
      const response = await fetch(`/api/flights?flight=${flightNumber.trim()}`)
      const data = await response.json()

      if (data.airline) {
        setFlightData(data)
      } else {
        alert('Flight not found. Please check the flight number.')
      }
    } catch (error) {
      console.error('Error fetching flight:', error)
      alert('Error fetching flight details.')
    }
    setFetchingFlight(false)
  }

  const saveFlight = async () => {
    if (!flightData) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('bookings').insert({
      trip_id: tripId,
      user_id: user?.id,
      type: 'flight',
      title: `${flightData.airline} ${flightData.flightNumber}`,
      details: {
        ...flightData,
        pnr,
        seats,
      },
    })

    if (!error) {
      fetchBookings()
      setShowFlightForm(false)
      setFlightNumber('')
      setFlightData(null)
      setPnr('')
      setSeats('')
    }
  }

  const flights = bookings.filter((b) => b.type === 'flight')
  const hotels = bookings.filter((b) => b.type === 'hotel')

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Flights Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Plane className="w-4 h-4" /> Flights
          </h4>
          <button
            onClick={() => setShowFlightForm(true)}
            className="text-purple-600 text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Flight
          </button>
        </div>

        {/* Flight Form */}
        {showFlightForm && (
          <div className="bg-purple-50 rounded-2xl p-4 mb-3">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="Flight number (e.g., EK524)"
                className="flex-1 px-3 py-2 bg-white rounded-xl text-sm outline-none"
              />
              <button
                onClick={fetchFlightDetails}
                disabled={fetchingFlight}
                className="px-3 py-2 bg-purple-500 text-white rounded-xl text-sm"
              >
                {fetchingFlight ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>

            {flightData && (
              <div className="bg-white rounded-xl p-3 mb-3">
                <p className="font-medium text-gray-800">{flightData.airline}</p>
                <p className="text-sm text-gray-600">
                  {flightData.departure?.iata} → {flightData.arrival?.iata}
                </p>
                {flightData.departure?.time && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(flightData.departure.time).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {flightData && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input
                    type="text"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    placeholder="PNR"
                    className="px-3 py-2 bg-white rounded-xl text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    placeholder="Seats (e.g., 12A, 12B)"
                    className="px-3 py-2 bg-white rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowFlightForm(false)
                      setFlightData(null)
                      setFlightNumber('')
                    }}
                    className="flex-1 py-2 bg-gray-200 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveFlight}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-sm"
                  >
                    Save Flight
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Saved Flights */}
        {flights.length > 0 ? (
          <div className="space-y-2">
            {flights.map((flight) => (
              <div key={flight.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {flight.details?.flightNumber} • {flight.details?.airline}
                    </p>
                    <p className="text-sm text-gray-600">
                      {flight.details?.departure?.iata} → {flight.details?.arrival?.iata}
                    </p>
                  </div>
                  {flight.details?.pnr && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      PNR: {flight.details.pnr}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showFlightForm && (
            <p className="text-gray-400 text-sm text-center py-2">No flights added</p>
          )
        )}
      </div>

      {/* Hotels Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Building className="w-4 h-4" /> Hotels
          </h4>
          <button
            onClick={() => setShowHotelForm(true)}
            className="text-purple-600 text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Hotel
          </button>
        </div>

        {hotels.length > 0 ? (
          <div className="space-y-2">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800">{hotel.details?.name}</p>
                <p className="text-sm text-gray-500">
                  Booking: #{hotel.details?.confirmationNumber}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-2">No hotels added</p>
        )}
      </div>
    </div>
  )
}
