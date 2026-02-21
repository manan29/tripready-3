'use client';

import { useState, useEffect } from 'react';
import { Check, Sun, Calculator, Phone, Building2 } from 'lucide-react';

interface DuringTripViewProps {
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
  'default': { phone: '+91 11 2301 2491', address: 'MEA Helpline, New Delhi' },
};

// Emergency numbers by country
const emergencyNumbers: Record<string, { police: string; ambulance: string }> = {
  'singapore': { police: '999', ambulance: '995' },
  'dubai': { police: '999', ambulance: '998' },
  'uae': { police: '999', ambulance: '998' },
  'thailand': { police: '191', ambulance: '1669' },
  'bali': { police: '110', ambulance: '118' },
  'indonesia': { police: '110', ambulance: '118' },
  'malaysia': { police: '999', ambulance: '999' },
  'maldives': { police: '119', ambulance: '102' },
  'japan': { police: '110', ambulance: '119' },
  'default': { police: '911', ambulance: '911' },
};

// Currency rates
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

export function DuringTripView({ trip, stageData, onUpdateStageData }: DuringTripViewProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const today = new Date();

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentDayNum = Math.min(
    Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
    totalDays
  );

  const [activeDay, setActiveDay] = useState(currentDayNum - 1);

  // Generate days array
  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: date.getDate(),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      itemCount: Math.floor(Math.random() * 4) + 1, // Replace with actual task count
    };
  });

  const currentDay = days[activeDay];

  // Sample tasks - in production, load from stageData
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Apply sunscreen on kids', done: false },
    { id: '2', text: 'Pack water bottles', done: true },
    { id: '3', text: 'Charge camera & phone', done: false },
    { id: '4', text: 'Carry snacks for kids', done: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const completedCount = tasks.filter(t => t.done).length;

  // Get destination-specific info
  const destKey = trip.destination?.toLowerCase() || 'default';
  const currency = currencyRates[destKey] || currencyRates['default'];
  const emergency = emergencyNumbers[destKey] || emergencyNumbers['default'];
  const embassy = embassyContacts[destKey] || embassyContacts['default'];

  return (
    <div className="space-y-4">

      {/* Day Strip - Horizontal Scroll */}
      <div className="overflow-x-auto -mx-5 px-5 scrollbar-hide">
        <div className="flex gap-2 pb-2">
          {days.map((day, index) => {
            const isActive = index === activeDay;
            const isToday = index === currentDayNum - 1;

            return (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`flex-shrink-0 flex flex-col items-center py-3 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#0A7A6E] text-white'
                    : 'bg-white text-[#1A1A1A] border border-[#E5E5E5]'
                }`}
              >
                <span className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                  {day.dayName}
                </span>
                <span className="text-xl font-bold">{day.dateNum}</span>

                {/* Activity dots */}
                {day.itemCount > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {Array(Math.min(day.itemCount, 4)).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : 'bg-[#0A7A6E]'}`}
                      />
                    ))}
                  </div>
                )}

                {isToday && !isActive && (
                  <span className="text-[10px] text-[#0A7A6E] font-medium mt-1">Today</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0F0F0]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-[#6B6B6B]">{currentDay?.fullDate}</p>
            <div className="flex items-center gap-2 mt-1">
              <Sun className="w-6 h-6 text-amber-400" />
              <span className="text-2xl font-bold text-[#1A1A1A]">32°C</span>
              <span className="text-[#6B6B6B]">Sunny</span>
            </div>
          </div>
        </div>

        {/* Hourly forecast */}
        <div className="flex justify-between pt-3 border-t border-[#F0F0F0]">
          {[
            { time: '9AM', temp: 28 },
            { time: '12PM', temp: 34 },
            { time: '3PM', temp: 32 },
            { time: '6PM', temp: 29 },
            { time: '9PM', temp: 26 },
          ].map((hour) => (
            <div key={hour.time} className="text-center">
              <p className="text-xs text-[#6B6B6B]">{hour.time}</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{hour.temp}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-[#1A1A1A]">Tasks</h3>
          <span className="text-sm text-[#6B6B6B]">{completedCount}/{tasks.length} done</span>
        </div>

        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 px-4 py-3 ${index < tasks.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                task.done
                  ? 'bg-[#0A7A6E] border-[#0A7A6E]'
                  : 'border-[#D4D4D4]'
              }`}
            >
              {task.done && <Check className="w-4 h-4 text-white" />}
            </button>

            <span className={`flex-1 ${task.done ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Access - Currency, Emergency, Embassy */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
        <h3 className="font-semibold text-[#1A1A1A] p-4 pb-2">Quick Access</h3>

        {/* Currency */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#F0F0F0]">
          <div className="w-10 h-10 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#0A7A6E]" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#1A1A1A]">Currency</p>
            <p className="text-sm text-[#6B6B6B]">₹1 = {currency.rate} {currency.code}</p>
          </div>
        </div>

        {/* Emergency */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#F0F0F0]">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#1A1A1A]">Emergency</p>
            <p className="text-sm text-[#6B6B6B]">
              {emergency.police} (Police) • {emergency.ambulance} (Ambulance)
            </p>
          </div>
        </div>

        {/* Indian Embassy */}
        <a
          href={`tel:${embassy.phone}`}
          className="flex items-center gap-4 px-4 py-3"
        >
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#1A1A1A]">🇮🇳 Indian Embassy</p>
            <p className="text-sm text-[#0A7A6E] font-medium">{embassy.phone}</p>
            <p className="text-xs text-[#6B6B6B]">{embassy.address}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
