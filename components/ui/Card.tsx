'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/design-system/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive, glow, children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-secondary border border-border-subtle',
      elevated: 'bg-dark-tertiary shadow-dark-md border border-border-subtle',
      outlined: 'bg-transparent border-2 border-border-default',
      glass: 'glass border border-border-subtle shadow-dark-lg',
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
          interactive && 'cursor-pointer hover:shadow-glow active:scale-[0.99]',
          glow && 'hover:shadow-glow',
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
