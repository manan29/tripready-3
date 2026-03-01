'use client';

import { cn } from '@/lib/design-system/cn';
import { Badge } from '@/components/ui/Badge';
import { Plane, ExternalLink } from 'lucide-react';

interface FlightCardProps {
  airline: string;
  flightNumber?: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  perPerson?: boolean;
  badge?: 'budget' | 'comfort' | 'recommended' | 'gold';
  pros?: string[];
  cons?: string[];
  insight?: string;
  bookingUrl?: string;
  className?: string;
}

export function FlightCard({
  airline,
  flightNumber,
  departure,
  arrival,
  duration,
  price,
  perPerson = true,
  badge,
  pros = [],
  cons = [],
  insight,
  bookingUrl,
  className,
}: FlightCardProps) {
  const badges = {
    budget: { label: '💰 Budget Pick', variant: 'warning' as const },
    comfort: { label: '⭐ Comfort Pick', variant: 'primary' as const },
    recommended: { label: '✨ Recommended', variant: 'success' as const },
    gold: { label: '👑 Premium', variant: 'gold' as const },
  };

  const isHighlighted = badge === 'comfort' || badge === 'recommended' || badge === 'gold';

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4 transition-all duration-200',
        isHighlighted
          ? 'border-primary-400/50 bg-primary-400/5 shadow-glow-sm'
          : 'border-border-default bg-dark-tertiary hover:border-border-strong',
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="mb-3">
          <Badge variant={badges[badge].variant} size="md">
            {badges[badge].label}
          </Badge>
        </div>
      )}

      {/* Flight Info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-text-primary text-lg">{airline}</p>
          {flightNumber && (
            <p className="text-sm text-text-tertiary">{flightNumber}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-primary-400">
            ₹{price.toLocaleString()}
          </p>
          {perPerson && (
            <p className="text-xs text-text-tertiary">per person</p>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 py-3 border-y border-border-subtle">
        <div className="text-center">
          <p className="font-semibold text-text-primary">{departure}</p>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-px bg-border-default" />
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Plane className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <div className="flex-1 h-px bg-border-default" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-text-primary">{arrival}</p>
        </div>
      </div>

      {/* Pros & Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pros.map((pro, i) => (
            <span key={`pro-${i}`} className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              ✓ {pro}
            </span>
          ))}
          {cons.map((con, i) => (
            <span key={`con-${i}`} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              {con}
            </span>
          ))}
        </div>
      )}

      {/* Insight */}
      {insight && (
        <div className="mt-3 p-3 bg-primary-400/10 rounded-xl border border-primary-400/20">
          <p className="text-sm text-primary-400">{insight}</p>
        </div>
      )}

      {/* Book Button */}
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
            isHighlighted
              ? 'bg-primary-400 text-dark-primary hover:bg-primary-500 shadow-glow'
              : 'bg-dark-elevated text-text-secondary hover:bg-dark-secondary'
          )}
        >
          Book on {airline}
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
