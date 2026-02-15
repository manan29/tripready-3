import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flightNumber = searchParams.get('flight')

    if (!flightNumber) {
      return NextResponse.json({ error: 'Flight number is required' }, { status: 400 })
    }

    // Call AviationStack API
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATION_API_KEY}&flight_iata=${flightNumber}`
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch flight data' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.data && data.data.length > 0) {
      const flight = data.data[0]
      return NextResponse.json({
        airline: flight.airline?.name || 'Unknown',
        flightNumber: flight.flight?.iata || flightNumber,
        departure: {
          airport: flight.departure?.airport || 'Unknown',
          iata: flight.departure?.iata || '',
          time: flight.departure?.scheduled || '',
          terminal: flight.departure?.terminal || '',
        },
        arrival: {
          airport: flight.arrival?.airport || 'Unknown',
          iata: flight.arrival?.iata || '',
          time: flight.arrival?.scheduled || '',
          terminal: flight.arrival?.terminal || '',
        },
        status: flight.flight_status || 'scheduled',
      })
    }

    return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
  } catch (error) {
    console.error('Flight API error:', error)
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 })
  }
}
