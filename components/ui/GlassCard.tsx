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
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function GlassCard({ children, className = '', onClick, padding = 'md' }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/70
        backdrop-blur-xl
        border border-white/40
        rounded-3xl
        shadow-[0px_8px_30px_rgba(0,0,0,0.04)]
        ${paddingMap[padding]}
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
