'use client';

import { useState } from 'react';
import { cn } from '@/lib/design-system/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'pills', size = 'md', className }: TabsProps) {
  const sizes = {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-2.5 px-4',
    lg: 'text-base py-3 px-5',
  };

  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-border-default', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 font-medium transition-all duration-200 border-b-2 -mb-px',
              sizes[size],
              activeTab === tab.id
                ? 'border-primary-400 text-primary-400'
                : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-border-strong'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded-full',
                activeTab === tab.id ? 'bg-primary-400/20 text-primary-400' : 'bg-dark-elevated text-text-tertiary'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex p-1 bg-dark-secondary rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 font-semibold rounded-lg transition-all duration-200',
            sizes[size],
            activeTab === tab.id
              ? 'bg-primary-400 text-dark-primary shadow-glow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge && (
            <span className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded-full',
              activeTab === tab.id ? 'bg-dark-primary/20 text-dark-primary' : 'bg-dark-elevated text-text-tertiary'
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
