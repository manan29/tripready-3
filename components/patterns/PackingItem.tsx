'use client';

import { cn } from '@/lib/design-system/cn';
import { Checkbox } from '@/components/ui/Checkbox';

interface PackingItemProps {
  id: string;
  text: string;
  checked: boolean;
  onToggle: () => void;
  category?: 'kids' | 'adults' | 'indian';
  priority?: boolean;
  className?: string;
}

export function PackingItem({ id, text, checked, onToggle, category, priority, className }: PackingItemProps) {
  return (
    <div
      className={cn(
        'py-3 px-1 border-b border-neutral-100 last:border-0',
        'transition-all duration-200',
        checked && 'opacity-60',
        className
      )}
    >
      <Checkbox
        checked={checked}
        onChange={onToggle}
        label={text}
        size="md"
      />
    </div>
  );
}
