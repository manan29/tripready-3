import { ReactNode } from 'react'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'

interface TimelineItem {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'locked'
  icon?: ReactNode
  onClick?: () => void
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isCompleted = item.status === 'completed'
        const isCurrent = item.status === 'current'
        const isLocked = item.status === 'locked'

        return (
          <div key={item.id} className="relative">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-4 top-10 bottom-0 w-0.5 -mb-4',
                  isCompleted ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'
                )}
              />
            )}

            {/* Timeline Item */}
            <div
              onClick={!isLocked ? item.onClick : undefined}
              className={cn(
                'relative flex gap-4',
                !isLocked && item.onClick && 'cursor-pointer group'
              )}
            >
              {/* Status Badge */}
              <div className="flex-shrink-0 relative z-10">
                <StatusBadge status={item.status} showIcon={true} size="md" />
              </div>

              {/* Content Card */}
              <div
                className={cn(
                  'flex-1 bg-white rounded-[16px] p-4',
                  'shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
                  'transition-all duration-300',
                  !isLocked && item.onClick && 'group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
                  isCurrent && 'border-2 border-[#9333EA]',
                  isLocked && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className={cn(
                        'font-semibold text-base mb-1',
                        isLocked ? 'text-[#94A3B8]' : 'text-[#1E293B]'
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p
                        className={cn(
                          'text-sm',
                          isLocked ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        )}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.icon && (
                    <div
                      className={cn(
                        'text-2xl ml-3',
                        isLocked && 'opacity-50'
                      )}
                    >
                      {item.icon}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
