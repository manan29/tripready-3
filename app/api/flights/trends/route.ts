import { NextResponse } from 'next/server';

interface FlightData {
  date: string;
  price: number;
  available: boolean;
}

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

const DIRECT_FLIGHT_COUNTS: Record<string, Record<string, number>> = {
  'Dubai': { 'Mumbai': 8, 'Delhi': 6, 'Bangalore': 4, 'Chennai': 3 },
  'Singapore': { 'Mumbai': 4, 'Delhi': 3, 'Bangalore': 3, 'Chennai': 2 },
  'Thailand': { 'Mumbai': 3, 'Delhi': 4, 'Bangalore': 2, 'Chennai': 2 },
  'Maldives': { 'Mumbai': 2, 'Delhi': 2, 'Bangalore': 1, 'Chennai': 1 },
  'Bali': { 'Mumbai': 1, 'Delhi': 1, 'Bangalore': 0, 'Chennai': 0 },
};

const BASE_PRICES: Record<string, number> = {
  'Dubai': 14000,
  'Singapore': 18000,
  'Thailand': 16000,
  'Maldives': 22000,
  'Bali': 25000,
  'Vietnam': 20000,
  'Sri Lanka': 12000,
  'Oman': 15000,
  'Georgia': 28000,
  'Azerbaijan': 26000,
  'Malaysia': 17000,
  'Mauritius': 35000,
};

const AIRLINES: Record<string, string[]> = {
  'Dubai': ['Emirates', 'IndiGo', 'Air India', 'Vistara'],
  'Singapore': ['Singapore Airlines', 'IndiGo', 'Air India', 'Vistara'],
  'Thailand': ['Thai Airways', 'IndiGo', 'Air India', 'Vistara'],
  'Maldives': ['IndiGo', 'Air India', 'GoFirst'],
  'default': ['IndiGo', 'Air India', 'Vistara'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || 'Dubai';
  const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];

  try {
    const basePrice = BASE_PRICES[destination] || 20000;
    const trends: FlightData[] = [];

    const start = new Date(startDate);

    for (let i = 0; i < 20; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      const weekendPremium = isWeekend ? 1.15 : 1;

      const randomVariation = 0.9 + Math.random() * 0.25;
      const price = Math.round(basePrice * weekendPremium * randomVariation);

      trends.push({
        date: date.toISOString().split('T')[0],
        price,
        available: true,
      });
    }

    const lowestPrice = Math.min(...trends.map(t => t.price));
    const lowestDate = trends.find(t => t.price === lowestPrice)?.date;
    const selectedDatePrice = trends[0]?.price || basePrice;
    const savings = selectedDatePrice - lowestPrice;

    const directFlights = DIRECT_FLIGHT_COUNTS[destination] || {
      'Mumbai': 2, 'Delhi': 2, 'Bangalore': 1, 'Chennai': 1
    };

    const airlines = AIRLINES[destination] || AIRLINES['default'];

    const bestFlight = {
      airline: airlines[0],
      flightNumber: `${airlines[0].substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
      departure: '07:30',
      arrival: destination === 'Dubai' ? '09:45' : destination === 'Singapore' ? '15:30' : '12:00',
      duration: destination === 'Dubai' ? '3h 15m' : destination === 'Singapore' ? '5h 30m' : '4h',
      price: selectedDatePrice,
      aircraft: airlines[0] === 'Emirates' ? 'A380' : 'A320',
      isDirect: true,
    };

    return NextResponse.json({
      destination,
      trends,
      lowestPrice,
      lowestDate,
      selectedDatePrice,
      savings,
      directFlights,
      airlines,
      bestFlight,
      recommendation: savings > 1500
        ? `Prices drop ₹${savings.toLocaleString()} if you shift to ${new Date(lowestDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : 'Good time to book - prices are stable',
    });

  } catch (error) {
    console.error('Flight trends error:', error);
    return NextResponse.json({ error: 'Failed to fetch flight trends' }, { status: 500 });
  }
}
