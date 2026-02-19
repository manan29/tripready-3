'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Plane, Hotel, AlertCircle, Phone, Camera, Plus, DollarSign, Check } from 'lucide-react'
import { getTripDayInfo, getEmergencyContacts } from '@/lib/trip-stages'
import { getCurrencyForCountry } from '@/lib/destinations'

interface DuringTripViewProps {
  trip: any
  stageData: any
  weather: any
  onUpdateStageData: (data: any) => void
}

export function DuringTripView({ trip, stageData, weather, onUpdateStageData }: DuringTripViewProps) {
  const dayInfo = getTripDayInfo(trip.start_date, trip.end_date)
  const currentDay = dayInfo.stage === 'during-trip' ? dayInfo.currentDay : 1
  const totalDays = dayInfo.totalDays
  const emergencyContacts = getEmergencyContacts(trip.country)
  const localCurrency = getCurrencyForCountry(trip.country)

  const [selectedDay, setSelectedDay] = useState(currentDay)
  const [inrAmount, setInrAmount] = useState('1000')
  const [convertedAmount, setConvertedAmount] = useState('')
  const [dailyChecklist, setDailyChecklist] = useState<string[]>([])

  const dailyChecklistItems = trip.num_kids > 0
    ? ['Sunscreen', 'Water bottles', 'Snacks', 'Medicines', 'Comfort toy']
    : ['Sunscreen', 'Water bottles', 'Wallet & cards', 'Phone charged', 'Itinerary']

  const handleCurrencyConvert = (amount: string) => {
    setInrAmount(amount)
    // Simplified conversion - in real app, fetch live rates
    const rate = localCurrency === 'AED' ? 22 : localCurrency === 'SGD' ? 60 : 0.36 // example rates
    const converted = (parseFloat(amount) / rate).toFixed(2)
    setConvertedAmount(converted)
  }

  const toggleChecklistItem = (item: string) => {
    setDailyChecklist((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  // Calculate available days (current + next, max totalDays)
  const availableDays = []
  if (currentDay <= totalDays) availableDays.push(currentDay)
  if (currentDay + 1 <= totalDays) availableDays.push(currentDay + 1)

  return (
    <div className="space-y-4 pb-4">
      {/* Day Tabs - Sliding Window */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {availableDays.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-[#9333EA] text-white shadow-lg'
                : 'bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#9333EA]'
            }`}
          >
            {day === currentDay ? `Today (Day ${day})` : `Tomorrow (Day ${day})`}
          </button>
        ))}
      </div>

      {/* Day Counter Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold">
              Day {selectedDay} of {totalDays}
            </h2>
            <p className="text-white/90 text-sm">{trip.destination}</p>
          </div>
          {weather && (
            <div className="text-right">
              <div className="text-3xl">{weather.icon || '☀️'}</div>
              <p className="text-sm text-white/90">{weather.temp}°C</p>
            </div>
          )}
        </div>
        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(selectedDay / totalDays) * 100}%` }}
          />
        </div>
      </div>

      {/* Flight & Hotel Info */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard padding="sm" className="cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <Plane className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-semibold text-[#1E293B] text-sm">Flight Info</p>
            <p className="text-xs text-[#64748B] mt-1">
              {stageData?.pre_trip?.flights?.airline || 'Not added'}
            </p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-2">
              <Hotel className="w-5 h-5 text-pink-600" />
            </div>
            <p className="font-semibold text-[#1E293B] text-sm">Hotel Info</p>
            <p className="text-xs text-[#64748B] mt-1">
              {stageData?.pre_trip?.hotels?.name || 'Not added'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Currency Converter */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-[#1E293B]">Quick Currency</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">INR</label>
            <input
              type="number"
              value={inrAmount}
              onChange={(e) => handleCurrencyConvert(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">{localCurrency}</label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-purple-600">
              {convertedAmount || '—'}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Emergency Contacts */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-[#1E293B]">Emergency Contacts</h3>
        </div>
        <div className="space-y-2">
          <a
            href={`tel:${emergencyContacts.police}`}
            className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-red-600" />
              <span className="font-medium text-[#1E293B] text-sm">Police</span>
            </div>
            <span className="text-red-600 font-bold">{emergencyContacts.police}</span>
          </a>
          <a
            href={`tel:${emergencyContacts.ambulance}`}
            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-[#1E293B] text-sm">Ambulance</span>
            </div>
            <span className="text-orange-600 font-bold">{emergencyContacts.ambulance}</span>
          </a>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#1E293B] text-sm">{emergencyContacts.embassy}</span>
              <a href={`tel:${emergencyContacts.embassyPhone}`} className="text-blue-600 font-bold text-sm">
                {emergencyContacts.embassyPhone}
              </a>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Daily Checklist */}
      <GlassCard>
        <h3 className="font-bold text-[#1E293B] mb-3">Today's Checklist</h3>
        <div className="space-y-2">
          {dailyChecklistItems.map((item) => (
            <div
              key={item}
              onClick={() => toggleChecklistItem(item)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                dailyChecklist.includes(item) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  dailyChecklist.includes(item) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}
              >
                {dailyChecklist.includes(item) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span
                className={`text-sm ${
                  dailyChecklist.includes(item) ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'
                }`}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
          <Camera className="w-5 h-5" />
          Add Memory
        </button>
        <button className="py-4 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
          <Plus className="w-5 h-5" />
          Track Expense
        </button>
      </div>
    </div>
  )
}
