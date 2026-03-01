'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/design-system/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
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
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg active:shadow-sm',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
      ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
      outline: 'bg-transparent border-2 border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
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
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
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
