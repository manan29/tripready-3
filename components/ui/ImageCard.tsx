'use client';

import { getDestinationImage } from '@/lib/destination-images';

interface ImageCardProps {
  destination: string;
  title: string;
  subtitle?: string;
  height?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  action?: React.ReactNode;
}

const heightMap = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
};

export function ImageCard({
  destination,
  title,
  subtitle,
  height = 'md',
  onClick,
  action,
}: ImageCardProps) {
  const imageUrl = getDestinationImage(destination);

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden ${heightMap[height]} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
    >
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 overlay-gradient" />

      {action && (
        <div className="absolute top-3 right-3">
          {action}
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-bold text-xl">{title}</h3>
        {subtitle && (
          <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
