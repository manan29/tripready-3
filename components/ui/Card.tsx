'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/design-system/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-neutral-100',
      elevated: 'bg-white shadow-lg',
      outlined: 'bg-transparent border-2 border-neutral-200',
      glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-200',
          variants[variant],
          paddings[padding],
          interactive && 'cursor-pointer hover:shadow-md active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export { Card };
