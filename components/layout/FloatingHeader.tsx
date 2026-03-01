'use client';

import { cn } from '@/lib/design-system/cn';

interface FloatingHeaderProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function FloatingHeader({ left, center, right, transparent, className }: FloatingHeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 px-4 pt-safe-top',
        !transparent && 'bg-white/80 backdrop-blur-xl border-b border-neutral-100/50',
        className
      )}
    >
      <div className="flex items-center justify-between h-14">
        <div className="flex-1 flex justify-start">{left}</div>
        <div className="flex-1 flex justify-center">{center}</div>
        <div className="flex-1 flex justify-end">{right}</div>
      </div>
    </header>
  );
}
