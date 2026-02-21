'use client';

import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
}

export function InfoCard({ icon: Icon, label, value, sublabel }: InfoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F0F0]">
      <Icon className="w-5 h-5 text-[#0A7A6E] mb-2" />
      <p className="text-xs text-[#6B6B6B]">{label}</p>
      <p className="text-base font-bold text-[#1A1A1A]">{value}</p>
      {sublabel && (
        <p className="text-xs text-[#6B6B6B]">{sublabel}</p>
      )}
    </div>
  );
}
