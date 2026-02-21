'use client';

import { Check } from 'lucide-react';

interface ChecklistItemProps {
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle?: () => void;
  action?: React.ReactNode;
}

export function ChecklistItem({
  title,
  subtitle,
  checked,
  onToggle,
  action,
}: ChecklistItemProps) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#F0F0F0] last:border-b-0">
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          checked
            ? 'bg-[#0A7A6E] border-[#0A7A6E]'
            : 'border-[#D4D4D4] hover:border-[#0A7A6E]'
        }`}
      >
        {checked && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-[#6B6B6B] mt-0.5">{subtitle}</p>
        )}
      </div>

      {action && !checked && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
