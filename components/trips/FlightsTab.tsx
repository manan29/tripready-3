'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, Plane, Trash2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Flight {
  id: string
  airline: string
  flight_number: string
  departure_airport: string
  arrival_airport: string
  departure_time: string
  arrival_time: string
  booking_reference: string | null
  seat_numbers: string | null
  direction: string
}

interface FlightsTabProps {
  tripId: string
  userId: string
}

export function FlightsTab({ tripId, userId }: FlightsTabProps) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newFlight, setNewFlight] = useState({
    airline: '',
    flight_number: '',
    departure_airport: '',
    arrival_airport: '',
    departure_time: '',
    arrival_time: '',
    booking_reference: '',
    seat_numbers: '',
    direction: 'outbound',
  })

  const supabase = createClient()

  useEffect(() => {
    loadFlights()
  }, [tripId])

  async function loadFlights() {
    const { data } = await supabase
      .from('flights')
      .select('*')
      .eq('trip_id', tripId)
      .order('departure_time', { ascending: true })

    setFlights(data || [])
    setIsLoading(false)
  }

  async function addFlight() {
    if (!newFlight.airline.trim() || !newFlight.flight_number.trim()) return

    const { data, error } = await supabase
      .from('flights')
      .insert({
        trip_id: tripId,
        user_id: userId,
        airline: newFlight.airline,
        flight_number: newFlight.flight_number,
        departure_airport: newFlight.departure_airport,
        arrival_airport: newFlight.arrival_airport,
        departure_time: newFlight.departure_time,
        arrival_time: newFlight.arrival_time,
        booking_reference: newFlight.booking_reference || null,
        seat_numbers: newFlight.seat_numbers || null,
        direction: newFlight.direction,
      })
      .select()
      .single()

    if (data) {
      setFlights([...flights, data])
      setNewFlight({
        airline: '',
        flight_number: '',
        departure_airport: '',
        arrival_airport: '',
        departure_time: '',
        arrival_time: '',
        booking_reference: '',
        seat_numbers: '',
        direction: 'outbound',
      })
      setIsAdding(false)
    }
  }

  async function deleteFlight(flightId: string) {
    setFlights(flights.filter(f => f.id !== flightId))
    await supabase.from('flights').delete().eq('id', flightId)
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading flights...</div>
  }

  return (
    <div>
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors mb-6"
        >
          <Plus className="h-5 w-5" />
          Add Flight
        </button>
      )}

      {isAdding && (
        <div className="bg-white rounded-2xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Airline (e.g., Air India)"
              value={newFlight.airline}
              onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
            <input
              type="text"
              placeholder="Flight # (e.g., AI302)"
              value={newFlight.flight_number}
              onChange={(e) => setNewFlight({ ...newFlight, flight_number: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="From (e.g., BLR)"
              value={newFlight.departure_airport}
              onChange={(e) => setNewFlight({ ...newFlight, departure_airport: e.target.value.toUpperCase() })}
              maxLength={3}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 uppercase"
            />
            <input
              type="text"
              placeholder="To (e.g., SIN)"
              value={newFlight.arrival_airport}
              onChange={(e) => setNewFlight({ ...newFlight, arrival_airport: e.target.value.toUpperCase() })}
              maxLength={3}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Departure</label>
              <input
                type="datetime-local"
                value={newFlight.departure_time}
                onChange={(e) => setNewFlight({ ...newFlight, departure_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Arrival</label>
              <input
                type="datetime-local"
                value={newFlight.arrival_time}
                onChange={(e) => setNewFlight({ ...newFlight, arrival_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Booking ref (PNR)"
              value={newFlight.booking_reference}
              onChange={(e) => setNewFlight({ ...newFlight, booking_reference: e.target.value.toUpperCase() })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 uppercase"
            />
            <input
              type="text"
              placeholder="Seats (e.g., 12A, 12B)"
              value={newFlight.seat_numbers}
              onChange={(e) => setNewFlight({ ...newFlight, seat_numbers: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
          </div>

          <select
            value={newFlight.direction}
            onChange={(e) => setNewFlight({ ...newFlight, direction: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          >
            <option value="outbound">Outbound Flight</option>
            <option value="return">Return Flight</option>
            <option value="connecting">Connecting Flight</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={addFlight}
              className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Save Flight
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {flights.map((flight) => {
          const departure = formatDateTime(flight.departure_time)
          const arrival = formatDateTime(flight.arrival_time)

          return (
            <div key={flight.id} className="bg-white rounded-xl p-4 relative overflow-hidden">
              <div className={cn(
                'absolute top-0 right-0 text-xs px-3 py-1 rounded-bl-xl capitalize',
                flight.direction === 'outbound' && 'bg-blue-100 text-blue-700',
                flight.direction === 'return' && 'bg-green-100 text-green-700',
                flight.direction === 'connecting' && 'bg-gray-100 text-gray-700'
              )}>
                {flight.direction}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{flight.airline}</span>
                <span className="text-gray-500">{flight.flight_number}</span>
                <button
                  onClick={() => deleteFlight(flight.id)}
                  className="ml-auto text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{flight.departure_airport}</div>
                  <div className="text-sm text-gray-500">{departure.time}</div>
                  <div className="text-xs text-gray-400">{departure.date}</div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex-1 border-t border-dashed border-gray-300"></div>
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  <div className="flex-1 border-t border-dashed border-gray-300"></div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{flight.arrival_airport}</div>
                  <div className="text-sm text-gray-500">{arrival.time}</div>
                  <div className="text-xs text-gray-400">{arrival.date}</div>
                </div>
              </div>

              {(flight.booking_reference || flight.seat_numbers) && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
                  {flight.booking_reference && (
                    <div>
                      <span className="text-gray-500">PNR: </span>
                      <span className="font-mono font-medium">{flight.booking_reference}</span>
                    </div>
                  )}
                  {flight.seat_numbers && (
                    <div>
                      <span className="text-gray-500">Seats: </span>
                      <span className="font-medium">{flight.seat_numbers}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {flights.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-400">
          <p>No flights added yet</p>
          <p className="text-sm mt-1">Add your flight details to keep everything in one place</p>
        </div>
      )}
    </div>
  )
}
