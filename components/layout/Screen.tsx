'use client';

import { cn } from '@/lib/design-system/cn';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  safeAreaBottom?: boolean;
}

export function Screen({ children, className, gradient = true, safeAreaBottom = true }: ScreenProps) {
  return (
    <div
      className={cn(
        'min-h-screen',
        gradient && 'bg-gradient-to-b from-dark-primary via-dark-secondary to-dark-primary',
        !gradient && 'bg-dark-primary',
        safeAreaBottom && 'pb-safe',
        className
      )}
    >
      {children}
    </div>
  );
}
