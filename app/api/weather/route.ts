import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const startDate = searchParams.get('start_date')

    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 })
    }

    // Calculate days until trip
    const daysUntilTrip = startDate
      ? Math.ceil((new Date(startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // If trip is within 5 days, use forecast API
    if (startDate && daysUntilTrip >= 0 && daysUntilTrip <= 5) {
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&appid=${apiKey}&units=metric`
      )

      if (!forecastResponse.ok) {
        // Fallback to current weather if forecast fails
        return getCurrentWeather(city, apiKey, 'expected during your trip')
      }

      const forecastData = await forecastResponse.json()

      // Find forecast closest to start date
      const targetTime = new Date(startDate).getTime()
      let closestForecast = forecastData.list[0]
      let smallestDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - targetTime)

      for (const forecast of forecastData.list) {
        const forecastTime = new Date(forecast.dt * 1000).getTime()
        const diff = Math.abs(forecastTime - targetTime)
        if (diff < smallestDiff) {
          smallestDiff = diff
          closestForecast = forecast
        }
      }

      // Calculate average temp for the trip period (next few forecasts)
      const tripForecasts = forecastData.list.slice(0, 8) // Next 24 hours of 3-hour intervals
      const avgTemp = Math.round(
        tripForecasts.reduce((sum: number, f: any) => sum + f.main.temp, 0) / tripForecasts.length
      )

      return NextResponse.json({
        temp: avgTemp,
        description: closestForecast.weather[0].description,
        icon: closestForecast.weather[0].icon,
        humidity: closestForecast.main.humidity,
        windSpeed: closestForecast.wind.speed,
        context: 'expected during your trip',
        isForecast: true,
      })
    }

    // For trips more than 5 days away or no date, show current weather
    const context = startDate && daysUntilTrip > 5
      ? 'typical weather (check closer to trip)'
      : startDate && daysUntilTrip < 0
      ? 'current weather'
      : ''

    return getCurrentWeather(city, apiKey, context)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

async function getCurrentWeather(city: string, apiKey: string, context: string = '') {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch current weather')
  }

  const data = await response.json()

  return NextResponse.json({
    temp: Math.round(data.main.temp),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    context,
    isForecast: false,
  })
}
