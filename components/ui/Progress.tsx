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
            className="text-dark-elevated"
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
            className="text-primary-400 transition-all duration-500 ease-out drop-shadow-glow"
          />
        </svg>
        {showLabel && (
          <span className="absolute text-sm font-bold text-text-primary">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-dark-elevated rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out shadow-glow"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm font-medium text-text-secondary text-right">
          {Math.round(clampedValue)}%
        </p>
      )}
    </div>
  );
}
