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
      <div className={cn('flex border-b border-neutral-200', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 font-medium transition-all duration-200 border-b-2 -mb-px',
              sizes[size],
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded-full',
                activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'
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
    <div className={cn('inline-flex p-1 bg-neutral-100 rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 font-semibold rounded-lg transition-all duration-200',
            sizes[size],
            activeTab === tab.id
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge && (
            <span className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded-full',
              activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-600'
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
