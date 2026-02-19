import { Check, Lock, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'completed' | 'current' | 'locked'
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, label, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const statusConfig = {
    completed: {
      bg: 'bg-[#10B981]',
      text: 'text-white',
      icon: <Check className={iconSize[size]} />,
      label: label || 'Completed',
    },
    current: {
      bg: 'bg-white border-2 border-[#9333EA]',
      text: 'text-[#9333EA]',
      icon: <Circle className={cn(iconSize[size], 'fill-current')} />,
      label: label || 'Current',
    },
    locked: {
      bg: 'bg-[#E2E8F0]',
      text: 'text-[#94A3B8]',
      icon: <Lock className={iconSize[size]} />,
      label: label || 'Locked',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            sizeClasses[size],
            config.bg,
            config.text
          )}
        >
          {config.icon}
        </div>
      )}
      {label && <span className={cn('font-medium', config.text)}>{config.label}</span>}
    </div>
  )
}
