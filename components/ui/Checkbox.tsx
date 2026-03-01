'use client';

import { cn } from '@/lib/design-system/cn';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Checkbox({ checked, onChange, label, sublabel, disabled, size = 'md', className }: CheckboxProps) {
  const sizes = {
    sm: { box: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-sm' },
    md: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base' },
    lg: { box: 'w-7 h-7', icon: 'w-5 h-5', text: 'text-lg' },
  };

  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'flex items-start gap-3 text-left transition-all duration-200 group w-full',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
          sizes[size].box,
          checked
            ? 'bg-primary-400 border-primary-400 scale-100 shadow-glow-sm'
            : 'border-border-strong bg-dark-secondary group-hover:border-primary-400 group-hover:bg-primary-400/10'
        )}
      >
        <Check
          className={cn(
            sizes[size].icon,
            'text-dark-primary transition-all duration-200',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
          strokeWidth={3}
        />
      </div>
      {(label || sublabel) && (
        <div className="flex-1 pt-0.5">
          {label && (
            <span className={cn(
              'font-medium transition-all duration-200',
              sizes[size].text,
              checked ? 'text-text-tertiary line-through' : 'text-text-primary'
            )}>
              {label}
            </span>
          )}
          {sublabel && (
            <p className="text-sm text-text-tertiary mt-0.5">{sublabel}</p>
          )}
        </div>
      )}
    </button>
  );
}
