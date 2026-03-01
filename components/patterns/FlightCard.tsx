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
  badge?: 'budget' | 'comfort' | 'recommended';
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
  };

  const isHighlighted = badge === 'comfort' || badge === 'recommended';

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4 transition-all duration-200',
        isHighlighted
          ? 'border-primary-200 bg-gradient-to-br from-primary-50/50 to-white'
          : 'border-neutral-100 bg-white hover:border-neutral-200',
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
          <p className="font-bold text-neutral-900 text-lg">{airline}</p>
          {flightNumber && (
            <p className="text-sm text-neutral-500">{flightNumber}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-primary-600">
            ₹{price.toLocaleString()}
          </p>
          {perPerson && (
            <p className="text-xs text-neutral-500">per person</p>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 py-3 border-y border-neutral-100">
        <div className="text-center">
          <p className="font-semibold text-neutral-900">{departure}</p>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-px bg-neutral-200" />
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Plane className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-neutral-900">{arrival}</p>
        </div>
      </div>

      {/* Pros & Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pros.map((pro, i) => (
            <span key={`pro-${i}`} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
              ✓ {pro}
            </span>
          ))}
          {cons.map((con, i) => (
            <span key={`con-${i}`} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg">
              {con}
            </span>
          ))}
        </div>
      )}

      {/* Insight */}
      {insight && (
        <div className="mt-3 p-3 bg-primary-50 rounded-xl">
          <p className="text-sm text-primary-700">{insight}</p>
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
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          Book on {airline}
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
