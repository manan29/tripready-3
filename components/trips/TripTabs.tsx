'use client'

import Link from 'next/link'
import { Package, Calendar, Wallet, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TripTabsProps {
  tripId: string
  activeTab: string
}

const tabs = [
  { id: 'pre-trip', label: 'Pre-Trip', icon: Package },
  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'post-trip', label: 'Post-Trip', icon: Camera },
]

export function TripTabs({ tripId, activeTab }: TripTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <Link
                key={tab.id}
                href={`/trips/${tripId}?tab=${tab.id}`}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
