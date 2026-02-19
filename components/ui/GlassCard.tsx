'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function GlassCard({ children, className = '', onClick, padding = 'md' }: GlassCardProps) {
  // Defensive: Fallback to md padding if invalid value provided
  const safePadding = paddingMap[padding] || paddingMap.md

  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        rounded-[20px]
        shadow-[0_4px_20px_rgba(0,0,0,0.05)]
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        transition-all duration-300
        ${safePadding}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
