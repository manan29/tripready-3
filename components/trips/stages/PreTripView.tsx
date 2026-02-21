'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Lightbulb, Sun, Calculator } from 'lucide-react';

interface PreTripViewProps {
  trip: any;
  stageData: any;
  onUpdateStageData: (data: any) => void;
}

// Indian Embassy contacts by country
const embassyContacts: Record<string, { phone: string; address: string }> = {
  'singapore': { phone: '+65 6737 6777', address: '31 Grange Road, Singapore' },
  'dubai': { phone: '+971 4 397 1222', address: 'Al Habtoor Business Tower, Dubai' },
  'uae': { phone: '+971 4 397 1222', address: 'Al Habtoor Business Tower, Dubai' },
  'thailand': { phone: '+66 2 258 0300', address: '75/4 Soi Sukhumvit 23, Bangkok' },
  'bali': { phone: '+62 21 5204150', address: 'Jl. H.R. Rasuna Said, Jakarta' },
  'indonesia': { phone: '+62 21 5204150', address: 'Jl. H.R. Rasuna Said, Jakarta' },
  'malaysia': { phone: '+60 3 2093 3510', address: 'No. 2 Jalan Taman Duta, Kuala Lumpur' },
  'maldives': { phone: '+960 331 5662', address: 'Athireege Aage, Male' },
  'japan': { phone: '+81 3 3262 2391', address: '2-2-11 Kudan-Minami, Tokyo' },
  'default': { phone: '+91 11 2301 2491', address: 'MEA, New Delhi' },
};

// Currency rates (simplified - in production, fetch from API)
const currencyRates: Record<string, { code: string; rate: number }> = {
  'singapore': { code: 'SGD', rate: 0.016 },
  'dubai': { code: 'AED', rate: 0.044 },
  'uae': { code: 'AED', rate: 0.044 },
  'thailand': { code: 'THB', rate: 0.42 },
  'bali': { code: 'IDR', rate: 186.5 },
  'indonesia': { code: 'IDR', rate: 186.5 },
  'malaysia': { code: 'MYR', rate: 0.056 },
  'maldives': { code: 'MVR', rate: 0.18 },
  'japan': { code: 'JPY', rate: 1.79 },
  'default': { code: 'USD', rate: 0.012 },
};

// AI Tips based on destination and kid age
function getAITip(destination: string, kidAge: number): string {
  const tips: Record<string, string> = {
    'singapore': `Singapore is humid! Pack light cotton clothes for your ${kidAge}-year-old and carry a small umbrella for sudden showers.`,
    'dubai': `Dubai malls are heavily air-conditioned. Pack a light hoodie for your ${kidAge}-year-old, and don't forget ORS packets for the desert heat!`,
    'thailand': `Thai temples require covered shoulders. Pack a light scarf for your ${kidAge}-year-old to use as a cover-up.`,
    'bali': `Bali has many steps at temples. Bring comfortable shoes for your ${kidAge}-year-old and a carrier if they tire easily.`,
    'malaysia': `Malaysia is hot and humid. Pack breathable clothes and mosquito repellent for your ${kidAge}-year-old.`,
    'maldives': `The Maldives sun is strong! Pack high SPF sunscreen and a rash guard for your ${kidAge}-year-old.`,
    'japan': `Japan has lots of walking. Bring a lightweight stroller for your ${kidAge}-year-old and comfortable walking shoes.`,
  };
  return tips[destination?.toLowerCase()] || `Pack comfortable clothes and your ${kidAge}-year-old's favorite snacks from India!`;
}

export function PreTripView({ trip, stageData, onUpdateStageData }: PreTripViewProps) {
  const router = useRouter();
  const completedSteps = stageData?.pre_trip?.completed_steps || [];

  const steps = [
    { id: 'flights', title: 'Book Flights', subtitle: 'Find and book your flights' },
    { id: 'hotels', title: 'Book Hotels', subtitle: 'Family-friendly accommodations' },
    { id: 'visa-docs', title: 'Visa & Documents', subtitle: 'Upload passports & visa' },
    { id: 'packing', title: 'Packing List', subtitle: 'AI-generated for your family' },
  ];

  const handleMarkComplete = (stepId: string) => {
    const newCompletedSteps = completedSteps.includes(stepId)
      ? completedSteps.filter((s: string) => s !== stepId)
      : [...completedSteps, stepId];

    onUpdateStageData({
      ...stageData,
      pre_trip: {
        ...stageData?.pre_trip,
        completed_steps: newCompletedSteps,
      },
    });
  };

  const handleStepAction = (stepId: string) => {
    if (stepId === 'packing') {
      router.push(`/trips/${trip.id}/packing`);
    } else if (stepId === 'visa-docs') {
      router.push(`/trips/${trip.id}/documents`);
    } else {
      handleMarkComplete(stepId);
    }
  };

  // Calculate progress
  const completedCount = completedSteps.length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const remainingCount = totalCount - completedCount;

  // Days to go
  const daysToGo = Math.max(0, Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // Get currency info
  const destKey = trip.destination?.toLowerCase() || 'default';
  const currency = currencyRates[destKey] || currencyRates['default'];

  // Get AI tip
  const kidAge = trip.kid_ages?.[0] || 3;
  const aiTip = getAITip(trip.destination, kidAge);

  return (
    <div className="space-y-4">

      {/* Days to Go + Weather & Currency */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
        <p className="text-3xl font-bold text-[#1A1A1A]">
          {daysToGo} <span className="text-lg font-medium text-[#6B6B6B]">days to go</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Weather */}
          <div className="bg-[#F8F7F5] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-[#6B6B6B]">Weather</span>
            </div>
            <p className="font-semibold text-[#1A1A1A]">32°C Sunny</p>
            <p className="text-xs text-[#6B6B6B]">{trip.destination}</p>
          </div>

          {/* Currency */}
          <div className="bg-[#F8F7F5] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-[#0A7A6E]" />
              <span className="text-xs text-[#6B6B6B]">Currency</span>
            </div>
            <p className="font-semibold text-[#1A1A1A]">₹1 = {currency.rate}</p>
            <p className="text-xs text-[#6B6B6B]">{currency.code}</p>
          </div>
        </div>
      </div>

      {/* Trip Readiness Progress */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1A1A1A]">Trip Readiness</h3>
          <span className="text-2xl font-bold text-[#0A7A6E]">{progressPercent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-[#F0F0F0] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#0A7A6E] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-sm text-[#6B6B6B]">
          {completedCount} of {totalCount} tasks completed • {remainingCount} remaining
        </p>
      </div>

      {/* Pre-Trip Checklist */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
        <h3 className="font-semibold text-[#1A1A1A] p-4 pb-2">Pre-Trip Checklist</h3>

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-4 py-4 ${index < steps.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleMarkComplete(step.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-[#0A7A6E] border-[#0A7A6E]'
                    : 'border-[#D4D4D4]'
                }`}
              >
                {isCompleted && <Check className="w-4 h-4 text-white" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
                  {step.title}
                </p>
                <p className="text-sm text-[#6B6B6B]">{step.subtitle}</p>
              </div>

              {/* Action Button */}
              {!isCompleted && (step.id === 'packing' || step.id === 'visa-docs') && (
                <button
                  onClick={() => handleStepAction(step.id)}
                  className="flex items-center gap-1 text-sm font-semibold text-[#0A7A6E]"
                >
                  {step.id === 'packing' ? 'View' : 'Upload'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Tip */}
      {trip.num_kids > 0 && (
        <div className="bg-[#F0FDFA] rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#0A7A6E] rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A7A6E] mb-1">
                Tip for your {kidAge}-year-old
              </p>
              <p className="text-sm text-[#1A1A1A]">
                {aiTip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
