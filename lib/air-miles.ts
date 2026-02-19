// Approximate air miles from major Indian cities to destinations
// Based on one-way distance from Delhi/Mumbai/Bangalore

export const AIR_MILES_FROM_INDIA: Record<string, number> = {
  // Middle East
  'dubai': 1700,
  'abu dhabi': 1800,
  'uae': 1700,
  'doha': 1900,
  'qatar': 1900,
  'muscat': 1500,
  'oman': 1500,

  // Southeast Asia
  'singapore': 2500,
  'thailand': 1800,
  'bangkok': 1800,
  'phuket': 2000,
  'malaysia': 2200,
  'kuala lumpur': 2200,
  'bali': 3500,
  'indonesia': 3500,
  'vietnam': 2300,
  'cambodia': 2100,

  // East Asia
  'japan': 4500,
  'tokyo': 4500,
  'korea': 4000,
  'seoul': 4000,
  'hong kong': 3000,
  'china': 3500,

  // South Asia
  'sri lanka': 600,
  'colombo': 600,
  'maldives': 1200,
  'nepal': 500,
  'bhutan': 600,

  // Europe
  'london': 4500,
  'paris': 4300,
  'switzerland': 4100,
  'italy': 4200,
  'spain': 4800,
  'germany': 4000,
  'europe': 4500,

  // Others
  'australia': 6500,
  'sydney': 6500,
  'new zealand': 7500,
  'usa': 8500,
  'america': 8500,
};

export function calculateAirMiles(destination: string): number {
  const destLower = destination.toLowerCase();

  for (const [key, miles] of Object.entries(AIR_MILES_FROM_INDIA)) {
    if (destLower.includes(key)) {
      return miles * 2; // Round trip
    }
  }

  return 2000; // Default if not found
}

export function calculateTotalAirMiles(trips: any[]): number {
  return trips.reduce((total, trip) => {
    return total + calculateAirMiles(trip.destination || trip.country || '');
  }, 0);
}

export function formatAirMiles(miles: number): string {
  if (miles >= 1000) {
    return `${(miles / 1000).toFixed(1)}K`;
  }
  return miles.toString();
}
