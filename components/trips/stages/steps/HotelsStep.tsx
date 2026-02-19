'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowLeft, ExternalLink, Check } from 'lucide-react'

interface HotelsStepProps {
  trip: any
  stageData: any
  onBack: () => void
  onComplete: (data: any) => void
}

export function HotelsStep({ trip, stageData, onBack, onComplete }: HotelsStepProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    confirmation: '',
    price: '',
    checkIn: '',
    checkOut: '',
  })

  const bookingLinks = [
    { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${trip.destination}`, color: 'blue' },
    { name: 'Agoda', url: 'https://www.agoda.com/', color: 'purple' },
    { name: 'MakeMyTrip', url: 'https://www.makemytrip.com/hotels/', color: 'orange' },
    { name: 'Airbnb', url: 'https://www.airbnb.co.in/', color: 'pink' },
  ]

  const handleSubmit = () => {
    onComplete({
      ...stageData,
      pre_trip: {
        ...stageData?.pre_trip,
        hotels: formData,
        completed_steps: [...(stageData?.pre_trip?.completed_steps || []), 'hotels'],
      },
    })
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Book Hotels</h2>
          <p className="text-sm text-gray-500">Family-friendly accommodations</p>
        </div>
      </div>

      {/* Tips for Families */}
      {trip.num_kids > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <h3 className="font-semibold text-purple-900 text-sm mb-2">👨‍👩‍👧‍👦 Tips for Families</h3>
          <ul className="space-y-1 text-sm text-purple-800">
            <li>✓ Look for family rooms or suites</li>
            <li>✓ Check for kids' pool and play area</li>
            <li>✓ Verify crib/cot availability</li>
            <li>✓ Near parks or kid-friendly attractions</li>
          </ul>
        </div>
      )}

      {/* Booking Links */}
      <GlassCard>
        <h3 className="font-semibold text-gray-800 mb-3">Search Hotels</h3>
        <div className="space-y-2">
          {bookingLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl hover:shadow-md transition-all bg-gray-50 border border-gray-200 hover:border-purple-300"
            >
              <span className="font-medium text-gray-800">{link.name}</span>
              <ExternalLink className="w-4 h-4 text-purple-600" />
            </a>
          ))}
        </div>
      </GlassCard>

      {/* Already Booked Form */}
      <GlassCard>
        <h3 className="font-semibold text-gray-800 mb-3">Already Booked?</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Marriott Hotel"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Hotel address"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation #</label>
              <input
                type="text"
                value={formData.confirmation}
                onChange={(e) => setFormData({ ...formData, confirmation: e.target.value })}
                placeholder="HTL123456"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="15000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.price}
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
