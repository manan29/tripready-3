'use client';

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/design-system/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center rounded-xl border-2 transition-all duration-200',
            'bg-dark-secondary border-border-default',
            focused && 'bg-dark-tertiary border-primary-400 ring-4 ring-primary-400/20',
            error && 'border-red-500 bg-red-500/10',
            !focused && !error && 'hover:bg-dark-tertiary hover:border-border-strong'
          )}
        >
          {leftIcon && (
            <span className="pl-3 text-text-tertiary">{leftIcon}</span>
          )}
          <input
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full h-12 px-4 bg-transparent text-text-primary placeholder-text-tertiary',
              'outline-none text-base',
              leftIcon && 'pl-2',
              rightIcon && 'pr-2',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="pr-3 text-text-tertiary">{rightIcon}</span>
          )}
        </div>
        {(error || hint) && (
          <p className={cn('mt-1.5 text-sm', error ? 'text-red-400' : 'text-text-tertiary')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
