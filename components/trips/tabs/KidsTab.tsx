'use client'

import KidsSection from '@/components/trips/sections/KidsSection'

interface KidsTabProps {
  tripId: string
  numKids: number
  kidAges?: number[]
}

export function KidsTab({ tripId, numKids, kidAges }: KidsTabProps) {
  if (numKids === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👶</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No kids on this trip</h3>
        <p className="text-gray-500">This trip is for adults only</p>
      </div>
    )
  }

  return (
    <div className="pb-4">
      <KidsSection tripId={tripId} numKids={numKids} kidAges={kidAges} />
    </div>
  )
}
