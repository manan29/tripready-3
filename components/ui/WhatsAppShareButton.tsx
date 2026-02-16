'use client';

import { generateWhatsAppShareText, shareToWhatsApp } from '@/lib/whatsapp';
import { Share2 } from 'lucide-react';

interface WhatsAppShareButtonProps {
  trip: {
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    numAdults: number;
    numKids: number;
    kidAges?: number[];
    packingProgress?: number;
    totalItems?: number;
  };
  className?: string;
}

export function WhatsAppShareButton({ trip, className = '' }: WhatsAppShareButtonProps) {
  const handleShare = () => {
    const text = generateWhatsAppShareText(trip);
    shareToWhatsApp(text);
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors ${className}`}
    >
      <Share2 className="w-4 h-4" />
      Share on WhatsApp
    </button>
  );
}
