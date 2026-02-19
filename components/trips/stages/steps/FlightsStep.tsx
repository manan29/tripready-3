'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowLeft, ExternalLink, TrendingUp, Bell, Check } from 'lucide-react'
import { getFlightBookingAdvice, isPeakSeason, getTripDayInfo } from '@/lib/trip-stages'

interface FlightsStepProps {
  trip: any
  stageData: any
  onBack: () => void
  onComplete: (data: any) => void
}

export function FlightsStep({ trip, stageData, onBack, onComplete }: FlightsStepProps) {
  const dayInfo = getTripDayInfo(trip.start_date, trip.end_date)
  const daysUntil = dayInfo.stage === 'pre-trip' ? dayInfo.daysUntil : 0
  const tripStartDate = new Date(trip.start_date)
  const isPeak = isPeakSeason(trip.destination, tripStartDate.getMonth())
  const advice = getFlightBookingAdvice(daysUntil, isPeak)

  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    pnr: '',
    price: '',
    departureTime: '',
    arrivalTime: '',
  })

  const bookingLinks = [
    { name: 'Skyscanner', url: `https://www.skyscanner.co.in/transport/flights/del/${trip.destination?.toLowerCase()}/`, color: 'blue' },
    { name: 'Google Flights', url: 'https://www.google.com/travel/flights', color: 'red' },
    { name: 'MakeMyTrip', url: 'https://www.makemytrip.com/flights/', color: 'orange' },
    { name: 'Cleartrip', url: 'https://www.cleartrip.com/flights', color: 'purple' },
  ]

  const handleSubmit = () => {
    onComplete({
      ...stageData,
      pre_trip: {
        ...stageData?.pre_trip,
        flights: formData,
        completed_steps: [...(stageData?.pre_trip?.completed_steps || []), 'flights'],
      },
    })
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#1E293B]" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Book Flights</h2>
          <p className="text-sm text-[#64748B]">{daysUntil} days until trip</p>
        </div>
      </div>

      {/* Price Insight */}
      <div
        className={`border-2 rounded-xl p-4 ${
          advice.color === 'red'
            ? 'bg-red-50 border-red-200'
            : advice.color === 'amber'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{advice.icon}</span>
          <div className="flex-1">
            <h3
              className={`font-bold text-base mb-1 ${
                advice.color === 'red'
                  ? 'text-red-900'
                  : advice.color === 'amber'
                  ? 'text-amber-900'
                  : 'text-green-900'
              }`}
            >
              {advice.title}
            </h3>
            <p
              className={`text-sm ${
                advice.color === 'red'
                  ? 'text-red-800'
                  : advice.color === 'amber'
                  ? 'text-amber-800'
                  : 'text-green-800'
              }`}
            >
              {advice.message}
            </p>
          </div>
        </div>
      </div>

      {/* Price Trend Visualization */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-[#1E293B]">Price Trend (Typical)</h3>
        </div>
        <div className="flex items-end justify-between h-32 gap-2">
          {[
            { label: '90+', height: 40, color: 'bg-green-400' },
            { label: '60-90', height: 50, color: 'bg-green-500' },
            { label: '30-60', height: 70, color: 'bg-amber-400' },
            { label: '7-30', height: 85, color: 'bg-amber-500' },
            { label: '<7', height: 100, color: 'bg-red-500' },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full ${bar.color} rounded-t-lg transition-all`} style={{ height: `${bar.height}%` }} />
              <span className="text-xs text-[#64748B]">{bar.label}d</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#64748B] text-center mt-3">Days before departure</p>
      </GlassCard>

      {/* Booking Links */}
      <GlassCard>
        <h3 className="font-semibold text-[#1E293B] mb-3">Search Flights</h3>
        <div className="space-y-2">
          {bookingLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-3 rounded-xl hover:shadow-md transition-all bg-${link.color}-50 border border-${link.color}-100`}
            >
              <span className={`font-medium text-${link.color}-800`}>{link.name}</span>
              <ExternalLink className={`w-4 h-4 text-${link.color}-600`} />
            </a>
          ))}
        </div>
      </GlassCard>

      {/* Price Alert */}
      <button className="w-full py-3 border-2 border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
        <Bell className="w-5 h-5" />
        Set Price Alert
      </button>

      {/* Already Booked Form */}
      <GlassCard>
        <h3 className="font-semibold text-[#1E293B] mb-3">Already Booked?</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
            <input
              type="text"
              value={formData.airline}
              onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              placeholder="e.g., Air India"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                placeholder="AI302"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PNR</label>
              <input
                type="text"
                value={formData.pnr}
                onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                placeholder="ABC123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="25000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.airline || !formData.price}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Mark as Booked
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
