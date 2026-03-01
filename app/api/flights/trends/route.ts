import { NextResponse } from 'next/server';

const DIRECT_FLIGHT_COUNTS: Record<string, Record<string, number>> = {
  'Dubai': { 'Mumbai': 8, 'Delhi': 6, 'Bangalore': 4, 'Chennai': 3, 'Hyderabad': 3, 'Kolkata': 2 },
  'Singapore': { 'Mumbai': 4, 'Delhi': 3, 'Bangalore': 3, 'Chennai': 2, 'Hyderabad': 2, 'Kolkata': 1 },
  'Thailand': { 'Mumbai': 3, 'Delhi': 4, 'Bangalore': 2, 'Chennai': 2, 'Hyderabad': 1, 'Kolkata': 2 },
  'Bangkok': { 'Mumbai': 3, 'Delhi': 4, 'Bangalore': 2, 'Chennai': 2, 'Hyderabad': 1, 'Kolkata': 2 },
  'Maldives': { 'Mumbai': 2, 'Delhi': 2, 'Bangalore': 1, 'Chennai': 1, 'Hyderabad': 0, 'Kolkata': 0 },
  'Bali': { 'Mumbai': 1, 'Delhi': 1, 'Bangalore': 1, 'Chennai': 0, 'Hyderabad': 0, 'Kolkata': 0 },
  'Vietnam': { 'Mumbai': 1, 'Delhi': 2, 'Bangalore': 0, 'Chennai': 0, 'Hyderabad': 0, 'Kolkata': 0 },
  'Sri Lanka': { 'Mumbai': 3, 'Delhi': 2, 'Bangalore': 2, 'Chennai': 4, 'Hyderabad': 1, 'Kolkata': 1 },
  'Oman': { 'Mumbai': 3, 'Delhi': 2, 'Bangalore': 2, 'Chennai': 2, 'Hyderabad': 2, 'Kolkata': 1 },
  'Georgia': { 'Mumbai': 1, 'Delhi': 2, 'Bangalore': 0, 'Chennai': 0, 'Hyderabad': 0, 'Kolkata': 0 },
  'Azerbaijan': { 'Mumbai': 1, 'Delhi': 1, 'Bangalore': 0, 'Chennai': 0, 'Hyderabad': 0, 'Kolkata': 0 },
  'Malaysia': { 'Mumbai': 2, 'Delhi': 3, 'Bangalore': 2, 'Chennai': 2, 'Hyderabad': 1, 'Kolkata': 1 },
  'Mauritius': { 'Mumbai': 2, 'Delhi': 1, 'Bangalore': 1, 'Chennai': 0, 'Hyderabad': 0, 'Kolkata': 0 },
};

const BASE_PRICES: Record<string, Record<string, number>> = {
  'Dubai': { 'Mumbai': 14000, 'Delhi': 16000, 'Bangalore': 15000, 'Chennai': 15500, 'Hyderabad': 15000, 'Kolkata': 18000 },
  'Singapore': { 'Mumbai': 18000, 'Delhi': 20000, 'Bangalore': 16000, 'Chennai': 17000, 'Hyderabad': 19000, 'Kolkata': 21000 },
  'Thailand': { 'Mumbai': 16000, 'Delhi': 15000, 'Bangalore': 17000, 'Chennai': 18000, 'Hyderabad': 18000, 'Kolkata': 14000 },
  'Bangkok': { 'Mumbai': 16000, 'Delhi': 15000, 'Bangalore': 17000, 'Chennai': 18000, 'Hyderabad': 18000, 'Kolkata': 14000 },
  'Maldives': { 'Mumbai': 22000, 'Delhi': 25000, 'Bangalore': 24000, 'Chennai': 23000, 'Hyderabad': 26000, 'Kolkata': 28000 },
  'Bali': { 'Mumbai': 28000, 'Delhi': 30000, 'Bangalore': 26000, 'Chennai': 32000, 'Hyderabad': 32000, 'Kolkata': 35000 },
  'default': { 'Mumbai': 20000, 'Delhi': 22000, 'Bangalore': 21000, 'Chennai': 22000, 'Hyderabad': 23000, 'Kolkata': 25000 },
};

const AIRLINES: Record<string, string[]> = {
  'Dubai': ['Emirates', 'IndiGo', 'Air India', 'Vistara', 'Flydubai'],
  'Singapore': ['Singapore Airlines', 'IndiGo', 'Air India', 'Vistara', 'Scoot'],
  'Thailand': ['Thai Airways', 'IndiGo', 'Air India', 'Vistara', 'Thai Smile'],
  'Bangkok': ['Thai Airways', 'IndiGo', 'Air India', 'Vistara', 'Thai Smile'],
  'Maldives': ['IndiGo', 'Air India', 'GoFirst', 'Maldivian'],
  'default': ['IndiGo', 'Air India', 'Vistara'],
};

const FLIGHT_DURATION: Record<string, Record<string, string>> = {
  'Dubai': { 'Mumbai': '3h 15m', 'Delhi': '3h 30m', 'Bangalore': '4h', 'Chennai': '4h 15m', 'Hyderabad': '3h 45m', 'Kolkata': '5h' },
  'Singapore': { 'Mumbai': '5h 30m', 'Delhi': '5h 45m', 'Bangalore': '4h 30m', 'Chennai': '4h 15m', 'Hyderabad': '5h', 'Kolkata': '4h' },
  'Thailand': { 'Mumbai': '4h 30m', 'Delhi': '4h 15m', 'Bangalore': '4h', 'Chennai': '3h 45m', 'Hyderabad': '4h 15m', 'Kolkata': '2h 45m' },
  'Bangkok': { 'Mumbai': '4h 30m', 'Delhi': '4h 15m', 'Bangalore': '4h', 'Chennai': '3h 45m', 'Hyderabad': '4h 15m', 'Kolkata': '2h 45m' },
  'Maldives': { 'Mumbai': '2h 30m', 'Delhi': '4h 15m', 'Bangalore': '1h 45m', 'Chennai': '1h 30m', 'Hyderabad': '2h 45m', 'Kolkata': '3h 30m' },
  'default': { 'Mumbai': '4h', 'Delhi': '4h 30m', 'Bangalore': '4h', 'Chennai': '4h', 'Hyderabad': '4h 15m', 'Kolkata': '4h 30m' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || 'Dubai';
  const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
  const fromCity = searchParams.get('fromCity') || 'Mumbai';

  try {
    const destPrices = BASE_PRICES[destination] || BASE_PRICES['default'];
    const basePrice = destPrices[fromCity] || destPrices['Mumbai'] || 20000;

    const trends: { date: string; price: number; day: string }[] = [];
    const start = new Date(startDate);

    // Generate realistic price trends for 20 days
    for (let i = 0; i < 20; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const dayOfWeek = date.getDay();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Weekend premium (Fri, Sat, Sun departures cost more)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 1.18 : 1;

      // Random daily variation (-8% to +12%)
      const randomVariation = 0.92 + Math.random() * 0.20;

      // Gradual increase as departure approaches (if within 14 days)
      const daysFromNow = Math.max(0, Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const urgencyMultiplier = daysFromNow < 7 ? 1.15 : daysFromNow < 14 ? 1.08 : 1;

      const price = Math.round(basePrice * weekendMultiplier * randomVariation * urgencyMultiplier);

      trends.push({
        date: date.toISOString().split('T')[0],
        price,
        day: dayName,
      });
    }

    // Find lowest and selected prices
    const prices = trends.map(t => t.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const lowestIndex = prices.indexOf(lowestPrice);
    const lowestDate = trends[lowestIndex]?.date;
    const selectedDatePrice = trends[0]?.price || basePrice;
    const savings = selectedDatePrice - lowestPrice;

    // Get direct flights for this route
    const destFlights = DIRECT_FLIGHT_COUNTS[destination] || {};
    const directFlightsFromCity = destFlights[fromCity] || 0;

    // All direct flights
    const directFlights: Record<string, number> = {};
    Object.entries(destFlights).forEach(([city, count]) => {
      if (count > 0) directFlights[city] = count;
    });

    // Airlines for this destination
    const airlines = AIRLINES[destination] || AIRLINES['default'];

    // Flight duration
    const durations = FLIGHT_DURATION[destination] || FLIGHT_DURATION['default'];
    const duration = durations[fromCity] || '4h';

    // Best flight recommendation
    const bestFlight = {
      airline: airlines[0],
      flightNumber: `${airlines[0].substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
      departure: '07:30',
      arrival: calculateArrival('07:30', duration),
      duration: duration,
      price: selectedDatePrice,
      aircraft: airlines[0] === 'Emirates' ? 'A380' : airlines[0] === 'Singapore Airlines' ? 'A350' : 'A320',
      isDirect: directFlightsFromCity > 0,
    };

    // Recommendation text
    let recommendation = '';
    if (savings > 2000) {
      recommendation = `💰 Save ₹${savings.toLocaleString()} by flying on ${new Date(lowestDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    } else if (savings > 1000) {
      recommendation = `Prices are ₹${savings.toLocaleString()} lower on ${new Date(lowestDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    } else {
      recommendation = '✓ Good time to book - prices are stable this week';
    }

    return NextResponse.json({
      destination,
      fromCity,
      trends,
      lowestPrice,
      highestPrice,
      lowestDate,
      selectedDatePrice,
      savings,
      directFlights,
      directFlightsFromCity,
      airlines,
      bestFlight,
      recommendation,
      hasTrends: true,
    });

  } catch (error) {
    console.error('Flight trends error:', error);
    return NextResponse.json({
      error: 'Failed to fetch flight trends',
      hasTrends: false,
      trends: [],
    }, { status: 500 });
  }
}

function calculateArrival(departure: string, duration: string): string {
  const [depHour, depMin] = departure.split(':').map(Number);
  const durationMatch = duration.match(/(\d+)h\s*(\d+)?m?/);
  if (!durationMatch) return '12:00';

  const durHours = parseInt(durationMatch[1]) || 0;
  const durMins = parseInt(durationMatch[2]) || 0;

  let arrHour = depHour + durHours;
  let arrMin = depMin + durMins;

  if (arrMin >= 60) {
    arrHour += 1;
    arrMin -= 60;
  }

  // Add 30 min for timezone difference (approximate)
  arrMin += 30;
  if (arrMin >= 60) {
    arrHour += 1;
    arrMin -= 60;
  }

  if (arrHour >= 24) arrHour -= 24;

  return `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;
}
