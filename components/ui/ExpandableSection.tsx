'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { IconCircle } from './IconCircle'

interface ExpandableSectionProps {
  title: string
  icon: ReactNode
  iconColor?: 'purple' | 'lavender' | 'plum' | 'grape' | 'green' | 'blue' | 'orange' | 'pink'
  badge?: string | number
  children: ReactNode
  defaultExpanded?: boolean
}

export function ExpandableSection({
  title,
  icon,
  iconColor = 'lavender',
  badge,
  children,
  defaultExpanded = false,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <GlassCard padding="none" className="overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <IconCircle icon={icon} color={iconColor} size="sm" />
          <span className="font-semibold text-gray-800">{title}</span>
          {badge !== undefined && (
            <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content - expandable */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0">{children}</div>
      </div>
    </GlassCard>
  )
}
