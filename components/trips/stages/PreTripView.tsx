'use client';

import { useState } from 'react';
import { ArrowLeft, Plane, Hotel, FileText, Backpack, Sun, Calculator, Lightbulb } from 'lucide-react';
import { ChecklistItem } from '@/components/ui/ChecklistItem';
import { InfoCard } from '@/components/ui/InfoCard';
import { getDestinationImage } from '@/lib/destination-images';

interface PreTripViewProps {
  trip: any;
  stageData: any;
  onUpdateStageData: (data: any) => void;
  onBack: () => void;
}

export function PreTripView({ trip, stageData, onUpdateStageData, onBack }: PreTripViewProps) {
  const completedSteps = stageData?.pre_trip?.completed_steps || [];

  const steps = [
    { id: 'flights', title: 'Book Flights', subtitle: 'Find the best deals', icon: Plane },
    { id: 'hotels', title: 'Book Hotels', subtitle: 'Family-friendly stays', icon: Hotel },
    { id: 'visa-docs', title: 'Visa & Documents', subtitle: 'Upload passports & visa', icon: FileText },
    { id: 'packing', title: 'Packing List', subtitle: 'AI-generated for your family', icon: Backpack },
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

  const progress = (completedSteps.length / steps.length) * 100;
  const daysToGo = Math.max(0, Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        <img
          src={getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 overlay-gradient" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Title */}
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="text-white font-bold text-3xl">{trip.destination}</h1>
          <p className="text-white/80">{trip.country || 'UAE'} • {trip.start_date} - {trip.end_date}</p>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        {/* Countdown Card */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-[#F0F0F0] mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6B6B6B] text-sm">{daysToGo} days to go</span>
            <span className="text-sm font-medium text-[#0A7A6E]">{completedSteps.length}/{steps.length} done</span>
          </div>
          <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A7A6E] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] mb-6">
          <h2 className="font-bold text-[#1A1A1A] p-4 pb-0">Pre-Trip Checklist</h2>
          <div className="px-4">
            {steps.map((step) => (
              <ChecklistItem
                key={step.id}
                title={step.title}
                subtitle={step.subtitle}
                checked={completedSteps.includes(step.id)}
                onToggle={() => handleMarkComplete(step.id)}
                action={
                  <button className="text-sm font-semibold text-[#0A7A6E]">
                    {step.id === 'visa-docs' ? 'Upload' : step.id === 'packing' ? 'View' : 'Mark Done'}
                  </button>
                }
              />
            ))}
          </div>
        </div>

        {/* AI Tip */}
        {trip.num_kids > 0 && (
          <div className="bg-[#F0FDFA] rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#0A7A6E] rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A7A6E] mb-1">
                  Tip for traveling with a {trip.kid_ages?.[0] || 3}-year-old
                </p>
                <p className="text-sm text-[#1A1A1A]">
                  {trip.destination} malls are air-conditioned and cold. Pack a light hoodie for your little one.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={Sun}
            label="Weather"
            value="32°C Sunny"
            sublabel={trip.destination}
          />
          <InfoCard
            icon={Calculator}
            label="Currency"
            value="₹1 = 0.044"
            sublabel="AED"
          />
        </div>
      </div>
    </div>
  );
}
