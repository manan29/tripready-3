import { NextResponse } from 'next/server';

interface Destination {
  name: string;
  country: string;
  code: string;
  flag: string;
  lat: number;
  lon: number;
}

const DESTINATIONS: Destination[] = [
  { name: 'Dubai', country: 'UAE', code: 'DXB', flag: '🇦🇪', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'Singapore', code: 'SIN', flag: '🇸🇬', lat: 1.3521, lon: 103.8198 },
  { name: 'Thailand', country: 'Bangkok', code: 'BKK', flag: '🇹🇭', lat: 13.7563, lon: 100.5018 },
  { name: 'Maldives', country: 'Maldives', code: 'MLE', flag: '🇲🇻', lat: 4.1755, lon: 73.5093 },
  { name: 'Bali', country: 'Indonesia', code: 'DPS', flag: '🇮🇩', lat: -8.3405, lon: 115.092 },
  { name: 'Vietnam', country: 'Vietnam', code: 'SGN', flag: '🇻🇳', lat: 10.8231, lon: 106.6297 },
  { name: 'Sri Lanka', country: 'Sri Lanka', code: 'CMB', flag: '🇱🇰', lat: 6.9271, lon: 79.8612 },
  { name: 'Oman', country: 'Oman', code: 'MCT', flag: '🇴🇲', lat: 23.588, lon: 58.3829 },
  { name: 'Georgia', country: 'Georgia', code: 'TBS', flag: '🇬🇪', lat: 41.7151, lon: 44.8271 },
  { name: 'Azerbaijan', country: 'Azerbaijan', code: 'GYD', flag: '🇦🇿', lat: 40.4093, lon: 49.8671 },
  { name: 'Malaysia', country: 'Malaysia', code: 'KUL', flag: '🇲🇾', lat: 3.139, lon: 101.6869 },
  { name: 'Mauritius', country: 'Mauritius', code: 'MRU', flag: '🇲🇺', lat: -20.3484, lon: 57.5522 },
];

const PEAK_SEASONS: Record<string, number[]> = {
  'Dubai': [11, 12, 1, 2, 3],
  'Singapore': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'Thailand': [11, 12, 1, 2, 3],
  'Maldives': [12, 1, 2, 3, 4],
  'Bali': [4, 5, 6, 7, 8, 9],
  'Vietnam': [12, 1, 2, 3],
  'Sri Lanka': [12, 1, 2, 3],
  'Oman': [10, 11, 12, 1, 2, 3],
  'Georgia': [6, 7, 8, 9],
  'Azerbaijan': [4, 5, 6, 9, 10],
  'Malaysia': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'Mauritius': [5, 6, 7, 8, 9, 10, 11],
};

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API not configured' }, { status: 500 });
  }

  const currentMonth = new Date().getMonth() + 1;

  try {
    const weatherPromises = DESTINATIONS.map(async (dest) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&units=metric&appid=${apiKey}`
        );
        const data = await res.json();

        const isPeak = PEAK_SEASONS[dest.name]?.includes(currentMonth) || false;
        const temp = Math.round(data.main?.temp || 25);
        const weather = data.weather?.[0]?.main || 'Clear';

        return {
          ...dest,
          temp,
          weather,
          isPeak,
          discount: isPeak ? null : Math.floor(Math.random() * 20) + 20,
        };
      } catch {
        return {
          ...dest,
          temp: 28,
          weather: 'Clear',
          isPeak: PEAK_SEASONS[dest.name]?.includes(currentMonth) || false,
          discount: null,
        };
      }
    });

    const results = await Promise.all(weatherPromises);

    const peak = results.filter(d => d.isPeak).slice(0, 4);
    const shoulder = results.filter(d => !d.isPeak).slice(0, 4);

    return NextResponse.json({ peak, shoulder });

  } catch (error) {
    console.error('Seasonal destinations error:', error);
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
  }
}
