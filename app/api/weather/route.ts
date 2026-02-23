import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Maldives';

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 });
  }

  try {
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoResponse.json();

    if (!geoData.length) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const { lat, lon } = geoData[0];

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastResponse.json();

    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const currentData = await currentResponse.json();

    const dailyForecasts: any[] = [];
    const seenDates = new Set();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!seenDates.has(date) && dailyForecasts.length < 7) {
        seenDates.add(date);
        dailyForecasts.push({
          date: item.dt * 1000,
          temp: Math.round(item.main.temp),
          weather: item.weather[0].main,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        });
      }
    }

    const temps = dailyForecasts.map(d => d.temp);
    const avgFirst = temps.length >= 3 ? (temps[0] + temps[1] + temps[2]) / 3 : temps[0];
    const avgLast = temps.length >= 3 ? (temps[temps.length - 3] + temps[temps.length - 2] + temps[temps.length - 1]) / 3 : temps[temps.length - 1];
    let trend = 'stable';
    if (avgLast - avgFirst > 2) trend = 'increasing';
    else if (avgFirst - avgLast > 2) trend = 'decreasing';

    const hasRain = dailyForecasts.some(d =>
      d.weather.toLowerCase().includes('rain') || d.weather.toLowerCase().includes('storm')
    );

    return NextResponse.json({
      current: {
        temp: Math.round(currentData.main.temp),
        weather: currentData.weather[0].main,
        icon: currentData.weather[0].icon,
        description: currentData.weather[0].description,
      },
      forecast: dailyForecasts,
      trend,
      hasRain,
      location: geoData[0].name,
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
