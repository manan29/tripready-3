'use client';

import { cn } from '@/lib/design-system/cn';

interface HeroCardProps {
  image: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  overlay?: 'light' | 'dark' | 'gradient';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function HeroCard({
  image,
  title,
  subtitle,
  badge,
  overlay = 'gradient',
  height = 'md',
  className,
  children,
}: HeroCardProps) {
  const heights = {
    sm: 'h-40',
    md: 'h-52',
    lg: 'h-64',
  };

  const overlays = {
    light: 'bg-white/20',
    dark: 'bg-black/60',
    gradient: 'bg-gradient-to-t from-dark-primary via-dark-primary/60 to-transparent',
  };

  return (
    <div className={cn('relative rounded-3xl overflow-hidden border border-border-subtle', heights[height], className)}>
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className={cn('absolute inset-0', overlays[overlay])} />

      {badge && (
        <div className="absolute top-4 right-4">{badge}</div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="text-white font-bold text-2xl tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
