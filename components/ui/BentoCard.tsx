import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
  className?: string
  onClick?: () => void
}

export function BentoCard({ children, size = 'medium', className, onClick }: BentoCardProps) {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6',
  }

  // Defensive: Fallback to medium size if invalid value provided
  const safeSize = sizeClasses[size] || sizeClasses.medium

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[20px]',
        'shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
        'hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
        'transition-all duration-300',
        safeSize,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
