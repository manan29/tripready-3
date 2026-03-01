'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/design-system/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading,
    icon,
    iconPosition = 'left',
    fullWidth,
    disabled,
    children,
    ...props
  }, ref) => {
    const variants = {
      primary: 'bg-primary-400 text-dark-primary hover:bg-primary-500 active:bg-primary-600 shadow-glow hover:shadow-glow-lg font-bold',
      secondary: 'bg-dark-elevated text-text-primary hover:bg-dark-tertiary active:bg-dark-secondary border border-border-default',
      ghost: 'bg-transparent text-text-secondary hover:bg-dark-tertiary active:bg-dark-elevated',
      outline: 'bg-transparent border-2 border-border-default text-text-primary hover:border-primary-400 hover:bg-primary-400/10',
      gold: 'bg-gold-400 text-dark-primary hover:bg-gold-500 active:bg-gold-600 shadow-glow-gold font-bold',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
      md: 'h-11 px-4 text-sm rounded-xl gap-2',
      lg: 'h-12 px-5 text-base rounded-xl gap-2',
      xl: 'h-14 px-6 text-base rounded-2xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          'active:scale-[0.98]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
