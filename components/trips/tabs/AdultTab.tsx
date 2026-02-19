'use client'

import PackingSection from '@/components/trips/sections/PackingSection'

interface AdultTabProps {
  tripId: string
  destination: string
  numKids: number
  kidAges?: number[]
}

export function AdultTab({ tripId, destination, numKids, kidAges }: AdultTabProps) {
  return (
    <div className="pb-4">
      <PackingSection
        tripId={tripId}
        destination={destination}
        numKids={numKids}
        kidAges={kidAges}
      />
    </div>
  )
}
