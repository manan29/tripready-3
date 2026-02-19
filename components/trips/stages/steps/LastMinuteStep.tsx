'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowLeft, Check } from 'lucide-react'

interface LastMinuteStepProps {
  trip: any
  stageData: any
  onBack: () => void
  onComplete: (data: any) => void
}

export function LastMinuteStep({ trip, stageData, onBack, onComplete }: LastMinuteStepProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const lastMinuteItems = [
    { id: 'forex', title: 'Buy forex / travel card', description: 'Get local currency or forex card', urgent: true },
    { id: 'sim', title: 'Get local SIM or intl roaming', description: 'Stay connected abroad', urgent: true },
    { id: 'maps', title: 'Download offline maps', description: 'Google Maps offline for destination', urgent: false },
    { id: 'documents', title: 'Print important documents', description: 'Hotel, flight confirmations', urgent: false },
    { id: 'bank', title: 'Inform bank about travel', description: 'Avoid card blocks abroad', urgent: true },
    { id: 'checkin', title: 'Web check-in for flights', description: 'Save time at airport', urgent: false },
    { id: 'luggage', title: 'Weigh and tag luggage', description: 'Check weight limits', urgent: false },
    { id: 'power', title: 'Charge all devices', description: 'Phone, camera, power banks', urgent: false },
  ]

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleComplete = () => {
    onComplete({
      ...stageData,
      pre_trip: {
        ...stageData?.pre_trip,
        last_minute_items: checkedItems,
        completed_steps: [...(stageData?.pre_trip?.completed_steps || []), 'last-minute'],
      },
    })
  }

  const completionPercentage = (checkedItems.length / lastMinuteItems.length) * 100

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#1E293B]" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Last Minute Checklist</h2>
          <p className="text-sm text-[#64748B]">Final preparations before departure</p>
        </div>
      </div>

      {/* Progress */}
      <GlassCard>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Completion</span>
          <span className="text-purple-600 font-bold">
            {checkedItems.length}/{lastMinuteItems.length}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </GlassCard>

      {/* Urgent Items First */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
        <h3 className="font-semibold text-red-900 text-sm mb-2">🚨 Urgent - Do First</h3>
        <div className="space-y-2">
          {lastMinuteItems
            .filter((item) => item.urgent)
            .map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  checkedItems.includes(item.id) ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    checkedItems.includes(item.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {checkedItems.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      checkedItems.includes(item.id) ? 'text-[#1E293B] line-through' : 'text-[#1E293B]'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Other Items */}
      <GlassCard>
        <h3 className="font-semibold text-[#1E293B] mb-3">Other Preparations</h3>
        <div className="space-y-2">
          {lastMinuteItems
            .filter((item) => !item.urgent)
            .map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  checkedItems.includes(item.id) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    checkedItems.includes(item.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {checkedItems.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      checkedItems.includes(item.id) ? 'text-[#1E293B] line-through' : 'text-[#1E293B]'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
        </div>
      </GlassCard>

      <button
        onClick={handleComplete}
        disabled={checkedItems.length < lastMinuteItems.filter((i) => i.urgent).length}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        {checkedItems.length < lastMinuteItems.filter((i) => i.urgent).length
          ? 'Complete urgent items first'
          : 'Mark as Complete'}
      </button>
    </div>
  )
}
