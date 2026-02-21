'use client';

import { Sun, Cloud, CloudRain } from 'lucide-react';

interface HourlyForecast {
  time: string;
  temp: number;
}

interface WeatherCardProps {
  dayName: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  hourly: HourlyForecast[];
}

const conditionIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
};

const conditionColors = {
  sunny: 'text-amber-400',
  cloudy: 'text-gray-400',
  rainy: 'text-blue-400',
};

export function WeatherCard({ dayName, temp, condition, hourly }: WeatherCardProps) {
  const Icon = conditionIcons[condition];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F0F0]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-[#6B6B6B]">{dayName}</p>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            {temp}°C <span className="text-lg font-medium capitalize">{condition}</span>
          </p>
        </div>
        <Icon className={`w-12 h-12 ${conditionColors[condition]}`} />
      </div>

      <div className="flex justify-between pt-3 border-t border-[#F0F0F0]">
        {hourly.map((hour) => (
          <div key={hour.time} className="text-center">
            <p className="text-xs text-[#6B6B6B]">{hour.time}</p>
            <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{hour.temp}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}
