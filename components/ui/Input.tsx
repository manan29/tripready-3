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
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center rounded-xl border-2 transition-all duration-200',
            'bg-neutral-50 border-transparent',
            focused && 'bg-white border-primary-500 ring-4 ring-primary-500/10',
            error && 'border-red-500 bg-red-50',
            !focused && !error && 'hover:bg-neutral-100'
          )}
        >
          {leftIcon && (
            <span className="pl-3 text-neutral-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full h-12 px-4 bg-transparent text-neutral-900 placeholder-neutral-400',
              'outline-none text-base',
              leftIcon && 'pl-2',
              rightIcon && 'pr-2',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="pr-3 text-neutral-400">{rightIcon}</span>
          )}
        </div>
        {(error || hint) && (
          <p className={cn('mt-1.5 text-sm', error ? 'text-red-500' : 'text-neutral-500')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
