'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BentoCard } from '@/components/ui/BentoCard'
import { Plane, Hotel, FileText, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'

export default function BookingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [trips, setTrips] = useState<any[]>([])
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch trips where visa-docs is completed
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

      if (tripsData) {
        // Filter trips that have visa-docs completed
        const tripsWithDocs = tripsData.filter(
          (trip) => trip.stage_data?.['pre-trip']?.['visa-docs']?.completed
        )
        setTrips(tripsWithDocs)
        if (tripsWithDocs.length > 0) {
          setSelectedTrip(tripsWithDocs[0])
        }
      }
      setIsLoading(false)
    }

    fetchTrips()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#64748B]">Loading bookings...</div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1E293B] mb-2">No Bookings Yet</h2>
          <p className="text-[#64748B] mb-6">
            Complete the Visa & Documents step in your trip to unlock bookings
          </p>
          <button
            onClick={() => router.push('/trips')}
            className="px-6 py-3 bg-[#9333EA] text-white rounded-xl font-medium hover:bg-[#7C3AED] transition-colors"
          >
            Go to My Trips
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getBookingData = (trip: any) => {
    return {
      flights: trip.stage_data?.['pre-trip']?.['flights'] || null,
      hotels: trip.stage_data?.['pre-trip']?.['hotels'] || null,
      documents: trip.stage_data?.['pre-trip']?.['visa-docs'] || null,
    }
  }

  const bookings = selectedTrip ? getBookingData(selectedTrip) : null

  return (
    <div className="min-h-screen pb-32 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#64748B] hover:text-[#9333EA] mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">My Bookings</h1>
          <p className="text-[#64748B]">All your travel bookings in one place</p>
        </div>

        {/* Trip Selector */}
        {trips.length > 1 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-[#1E293B] mb-2 block">Select Trip</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    selectedTrip?.id === trip.id
                      ? 'bg-[#9333EA] text-white'
                      : 'bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#9333EA]'
                  }`}
                >
                  {trip.destination}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trip Overview Card */}
        {selectedTrip && (
          <BentoCard size="large" className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B] mb-1">{selectedTrip.destination}</h2>
                <p className="text-[#64748B] text-sm">{selectedTrip.country}</p>
              </div>
              <div className="text-4xl">✈️</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9333EA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Check-in</p>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {formatDate(selectedTrip.start_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9333EA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Check-out</p>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {formatDate(selectedTrip.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9333EA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Travelers</p>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {(selectedTrip.num_adults || 2) + (selectedTrip.num_kids || 0)} people
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#9333EA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Duration</p>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {Math.ceil(
                      (new Date(selectedTrip.end_date).getTime() -
                        new Date(selectedTrip.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{' '}
                    days
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Bookings Section */}
        <div className="space-y-4">
          {/* Flight Booking */}
          <BentoCard size="large">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center flex-shrink-0">
                <Plane className="w-6 h-6 text-[#9333EA]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1E293B] text-lg mb-1">Flight Details</h3>
                {bookings?.flights ? (
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B]">Airline</span>
                      <span className="text-sm font-semibold text-[#1E293B]">
                        {bookings.flights.airline || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B]">Booking Reference</span>
                      <span className="text-sm font-semibold text-[#1E293B]">
                        {bookings.flights.pnr || 'Not specified'}
                      </span>
                    </div>
                    {bookings.flights.notes && (
                      <div className="pt-2 border-t border-[#E2E8F0]">
                        <p className="text-sm text-[#64748B]">{bookings.flights.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8] mt-2">No flight details added yet</p>
                )}
              </div>
            </div>
          </BentoCard>

          {/* Hotel Booking */}
          <BentoCard size="large">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FEF3C7] rounded-full flex items-center justify-center flex-shrink-0">
                <Hotel className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1E293B] text-lg mb-1">Hotel Details</h3>
                {bookings?.hotels ? (
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B]">Hotel Name</span>
                      <span className="text-sm font-semibold text-[#1E293B]">
                        {bookings.hotels.name || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B]">Address</span>
                      <span className="text-sm font-semibold text-[#1E293B] text-right">
                        {bookings.hotels.address || 'Not specified'}
                      </span>
                    </div>
                    {bookings.hotels.notes && (
                      <div className="pt-2 border-t border-[#E2E8F0]">
                        <p className="text-sm text-[#64748B]">{bookings.hotels.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8] mt-2">No hotel details added yet</p>
                )}
              </div>
            </div>
          </BentoCard>

          {/* Documents */}
          <BentoCard size="large">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#DBEAFE] rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1E293B] text-lg mb-1">Travel Documents</h3>
                {bookings?.documents ? (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span className="text-sm text-[#1E293B]">Visa & Documents Completed</span>
                    </div>
                    {bookings.documents.notes && (
                      <div className="pt-2 border-t border-[#E2E8F0]">
                        <p className="text-sm text-[#64748B]">{bookings.documents.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8] mt-2">No document details added yet</p>
                )}
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  )
}
