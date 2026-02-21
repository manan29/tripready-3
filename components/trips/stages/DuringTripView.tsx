'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, Phone } from 'lucide-react';
import { DayStrip } from '@/components/ui/DayStrip';
import { WeatherCard } from '@/components/ui/WeatherCard';
import { ChecklistItem } from '@/components/ui/ChecklistItem';
import { InfoCard } from '@/components/ui/InfoCard';
import { getDestinationImage } from '@/lib/destination-images';

interface DuringTripViewProps {
  trip: any;
  stageData: any;
  onUpdateStageData: (data: any) => void;
  onBack: () => void;
}

export function DuringTripView({ trip, stageData, onUpdateStageData, onBack }: DuringTripViewProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const [activeDay, setActiveDay] = useState(0);

  // Generate days array
  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: date.getDate(),
      itemCount: Math.floor(Math.random() * 4), // Replace with actual data
    };
  });

  const currentDay = days[activeDay];

  const tasks = [
    { id: '1', text: 'Apply sunscreen on kids', done: false },
    { id: '2', text: 'Pack water bottles', done: true },
    { id: '3', text: 'Charge camera & phone', done: false },
    { id: '4', text: 'Carry snacks for kids', done: false },
  ];

  const [taskStates, setTaskStates] = useState(tasks);

  const toggleTask = (id: string) => {
    setTaskStates(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const completedCount = taskStates.filter(t => t.done).length;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Image - Smaller */}
      <div className="relative h-48">
        <img
          src={getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 overlay-gradient" />

        <button
          onClick={onBack}
          className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-4 left-5">
          <h1 className="text-white font-bold text-2xl">{trip.destination}</h1>
          <p className="text-white/80">Day {activeDay + 1} of {totalDays}</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Day Strip */}
        <DayStrip
          days={days}
          activeIndex={activeDay}
          onDaySelect={setActiveDay}
        />

        {/* Weather */}
        <WeatherCard
          dayName={currentDay?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) || ''}
          temp={32}
          condition="sunny"
          hourly={[
            { time: '9AM', temp: 28 },
            { time: '12PM', temp: 34 },
            { time: '3PM', temp: 32 },
            { time: '6PM', temp: 29 },
            { time: '9PM', temp: 26 },
          ]}
        />

        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0]">
          <div className="flex items-center justify-between p-4 pb-0">
            <h2 className="font-bold text-[#1A1A1A]">Tasks</h2>
            <span className="text-sm text-[#6B6B6B]">{completedCount}/{taskStates.length} done</span>
          </div>
          <div className="px-4">
            {taskStates.map((task) => (
              <ChecklistItem
                key={task.id}
                title={task.text}
                checked={task.done}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={Calculator}
            label="Currency"
            value="₹1 = 0.044"
            sublabel="AED"
          />
          <InfoCard
            icon={Phone}
            label="Emergency"
            value="999"
            sublabel="Police"
          />
        </div>
      </div>
    </div>
  );
}
