'use client';

import { cn } from '@/lib/design-system/cn';

interface ProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, size = 'md', variant = 'linear', showLabel, className }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  if (variant === 'circular') {
    const sizes = { sm: 48, md: 64, lg: 80 };
    const strokeWidths = { sm: 4, md: 5, lg: 6 };
    const diameter = sizes[size];
    const strokeWidth = strokeWidths[size];
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedValue / 100) * circumference;

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg width={diameter} height={diameter} className="-rotate-90">
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-neutral-100"
          />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-500 ease-out"
          />
        </svg>
        {showLabel && (
          <span className="absolute text-sm font-bold text-neutral-900">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-neutral-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm font-medium text-neutral-600 text-right">
          {Math.round(clampedValue)}%
        </p>
      )}
    </div>
  );
}
