'use client';

interface Day {
  date: Date;
  dayName: string;
  dateNum: number;
  itemCount: number;
}

interface DayStripProps {
  days: Day[];
  activeIndex: number;
  onDaySelect: (index: number) => void;
}

export function DayStrip({ days, activeIndex, onDaySelect }: DayStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
      {days.map((day, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={index}
            onClick={() => onDaySelect(index)}
            className={`flex-shrink-0 flex flex-col items-center py-3 px-4 rounded-xl transition-colors ${
              isActive
                ? 'bg-[#0A7A6E] text-white'
                : 'bg-white text-[#1A1A1A] border border-[#E5E5E5]'
            }`}
          >
            <span className="text-xs font-medium opacity-80">{day.dayName}</span>
            <span className="text-xl font-bold">{day.dateNum}</span>

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
          </button>
        );
      })}
    </div>
  );
}
