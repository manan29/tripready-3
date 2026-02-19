'use client'

import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { KidsTab } from '@/components/trips/tabs/KidsTab'
import { AdultTab } from '@/components/trips/tabs/AdultTab'

interface PackingStepProps {
  trip: any
  tripId: string
  stageData: any
  kidsPackingList: any[]
  adultPackingList: any[]
  setKidsPackingList: (list: any[]) => void
  setAdultPackingList: (list: any[]) => void
  onBack: () => void
  onComplete: (data: any) => void
}

export function PackingStep({
  trip,
  tripId,
  stageData,
  kidsPackingList,
  adultPackingList,
  setKidsPackingList,
  setAdultPackingList,
  onBack,
  onComplete,
}: PackingStepProps) {
  const [activeTab, setActiveTab] = useState<'kids' | 'adult'>(trip.num_kids > 0 ? 'kids' : 'adult')

  const calculateProgress = (list: any[]) => {
    if (list.length === 0) return 0
    const totalItems = list.reduce((sum, cat) => sum + cat.items.length, 0)
    const packedItems = list.reduce((sum, cat) => sum + cat.items.filter((item: any) => item.packed).length, 0)
    return totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0
  }

  const kidsProgress = calculateProgress(kidsPackingList)
  const adultProgress = calculateProgress(adultPackingList)
  const overallProgress = trip.num_kids > 0 ? Math.round((kidsProgress + adultProgress) / 2) : adultProgress

  const handleComplete = () => {
    onComplete({
      ...stageData,
      pre_trip: {
        ...stageData?.pre_trip,
        packing_progress: { kids: kidsProgress, adults: adultProgress },
        completed_steps: [...(stageData?.pre_trip?.completed_steps || []), 'packing'],
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
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Packing Lists</h2>
          <p className="text-sm text-[#64748B]">Pack smart, travel light</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-purple-600 font-bold">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Tab Switcher */}
      {trip.num_kids > 0 && (
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('kids')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'kids' ? 'bg-white text-purple-600 shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Kids ({kidsProgress}%)
          </button>
          <button
            onClick={() => setActiveTab('adult')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'adult' ? 'bg-white text-purple-600 shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Adults ({adultProgress}%)
          </button>
        </div>
      )}

      {/* Packing List Content */}
      <div>
        {activeTab === 'kids' && trip.num_kids > 0 && (
          <KidsTab trip={trip} packingList={kidsPackingList} setPackingList={setKidsPackingList} />
        )}
        {activeTab === 'adult' && (
          <AdultTab
            tripId={tripId}
            trip={trip}
            packingList={adultPackingList}
            setPackingList={setAdultPackingList}
          />
        )}
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={overallProgress < 50}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 sticky bottom-4"
      >
        <Check className="w-5 h-5" />
        {overallProgress >= 50 ? 'Mark as Complete' : `Pack at least 50% (${overallProgress}% done)`}
      </button>
    </div>
  )
}
