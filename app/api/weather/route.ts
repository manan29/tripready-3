import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface WeatherInsight {
  tempMin: number
  tempMax: number
  trend: 'hotter' | 'cooler' | 'stable'
  rainDays: string[]
  mainCondition: string
  insight: string
  packingTip: string
  icon: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

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

    // If trip is within 5 days, use forecast API for detailed insights
    if (startDate && daysUntilTrip >= 0 && daysUntilTrip <= 5) {
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&appid=${apiKey}&units=metric`
      )

      if (!forecastResponse.ok) {
        return getCurrentWeather(city, apiKey, 'typical weather (check closer to trip)')
      }

      const forecastData = await forecastResponse.json()
      const insights = analyzeWeather(forecastData.list, startDate, endDate || startDate)

      return NextResponse.json({
        temp: Math.round((insights.tempMin + insights.tempMax) / 2),
        tempMin: insights.tempMin,
        tempMax: insights.tempMax,
        description: insights.mainCondition,
        icon: insights.icon,
        insight: insights.insight,
        packingTip: insights.packingTip,
        context: 'during your trip',
        isForecast: true,
        hasInsights: true,
      })
    }

    // For trips more than 5 days away, show current weather with note
    const context =
      startDate && daysUntilTrip > 5
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

function analyzeWeather(
  forecast: any[],
  startDate: string,
  endDate: string
): WeatherInsight {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000)

  // Filter forecasts within trip dates
  const tripForecasts = forecast.filter((f) => {
    const forecastDate = new Date(f.dt * 1000)
    return forecastDate >= start && forecastDate <= end
  })

  if (tripForecasts.length === 0) {
    // Fallback to first few forecasts
    const temps = forecast.slice(0, 8).map((f) => f.main.temp)
    const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
    return {
      tempMin: avgTemp - 2,
      tempMax: avgTemp + 2,
      trend: 'stable',
      rainDays: [],
      mainCondition: forecast[0].weather[0].main,
      insight: `Around ${avgTemp}°C expected`,
      packingTip: 'Pack comfortable clothes',
      icon: forecast[0].weather[0].icon,
    }
  }

  // Calculate temperature range
  const temps = tripForecasts.map((f) => f.main.temp)
  const tempMin = Math.round(Math.min(...temps))
  const tempMax = Math.round(Math.max(...temps))

  // Determine trend (compare first day vs last day)
  const firstDayTemps = tripForecasts.slice(0, Math.min(8, tripForecasts.length / 2))
  const lastDayTemps = tripForecasts.slice(-Math.min(8, tripForecasts.length / 2))
  const avgFirst = firstDayTemps.reduce((sum, f) => sum + f.main.temp, 0) / firstDayTemps.length
  const avgLast = lastDayTemps.reduce((sum, f) => sum + f.main.temp, 0) / lastDayTemps.length
  const tempDiff = avgLast - avgFirst

  const trend: 'hotter' | 'cooler' | 'stable' =
    tempDiff > 2 ? 'hotter' : tempDiff < -2 ? 'cooler' : 'stable'

  // Check for rain
  const rainForecasts = tripForecasts.filter((f) => f.weather[0].main === 'Rain')
  const rainDays = [...new Set(rainForecasts.map((f) => new Date(f.dt * 1000).toDateString()))]

  // Get most common weather condition
  const conditions = tripForecasts.map((f) => f.weather[0].main)
  const mainCondition =
    conditions
      .sort(
        (a, b) =>
          conditions.filter((c) => c === a).length - conditions.filter((c) => c === b).length
      )
      .pop() || 'Clear'

  // Generate insight and packing tip
  const { insight, packingTip, icon } = generateInsight(
    tempMin,
    tempMax,
    trend,
    rainDays.length,
    mainCondition
  )

  return {
    tempMin,
    tempMax,
    trend,
    rainDays,
    mainCondition,
    insight,
    packingTip,
    icon,
  }
}

function generateInsight(
  tempMin: number,
  tempMax: number,
  trend: string,
  rainDaysCount: number,
  condition: string
): { insight: string; packingTip: string; icon: string } {
  let insight = ''
  let packingTip = ''
  let icon = '☀️'

  // Temperature-based insights
  if (tempMax >= 38) {
    icon = '🥵'
    insight = `Very hot (${tempMin}-${tempMax}°C)! `
    if (trend === 'hotter') {
      insight += 'Getting even hotter towards end. '
    }
    insight += 'Stay hydrated, avoid midday sun'
    packingTip = 'Light cotton, sunscreen SPF 50+, hat, sunglasses'
  } else if (tempMax >= 32) {
    icon = '☀️'
    insight = `Hot & sunny (${tempMin}-${tempMax}°C). `
    if (trend === 'hotter') {
      insight += 'Getting hotter! '
    } else if (trend === 'cooler') {
      insight += 'Cooling down slightly. '
    }
    if (condition === 'Clear') {
      insight += 'Perfect beach weather!'
    }
    packingTip = 'Light clothes, sunscreen, swimwear'
  } else if (tempMax >= 25) {
    icon = '🌤️'
    insight = `Pleasant (${tempMin}-${tempMax}°C). `
    if (trend === 'hotter') {
      insight += 'Getting warmer! '
    } else if (trend === 'cooler') {
      insight += 'Getting cooler. '
    }
    packingTip = 'Comfortable clothes, light jacket for evenings'
  } else if (tempMax >= 15) {
    icon = '🌥️'
    insight = `Cool (${tempMin}-${tempMax}°C). `
    packingTip = 'Layers, jacket, long pants'
  } else {
    icon = '❄️'
    insight = `Cold (${tempMin}-${tempMax}°C)! `
    packingTip = 'Warm clothes, jacket, thermals'
  }

  // Rain alerts
  if (rainDaysCount > 0) {
    icon = '🌧️'
    if (rainDaysCount === 1) {
      insight += ' Rain expected on one day.'
    } else {
      insight += ` Rain expected on ${rainDaysCount} days.`
    }
    packingTip += ', umbrella/raincoat'
  }

  return { insight, packingTip, icon }
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
    hasInsights: false,
  })
}
