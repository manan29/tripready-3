export type TripStage = 'pre-trip' | 'during-trip' | 'post-trip';

export function getTripStage(startDate: string, endDate: string): TripStage {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 'pre-trip';
  if (now >= start && now <= end) return 'during-trip';
  return 'post-trip';
}

export function getTripDayInfo(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const stage = getTripStage(startDate, endDate);

  if (stage === 'pre-trip') {
    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { stage, daysUntil, totalDays };
  }
  if (stage === 'during-trip') {
    const currentDay = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { stage, currentDay, totalDays };
  }
  const daysAgo = Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
  return { stage, daysAgo, totalDays };
}

export const PRE_TRIP_STEPS = [
  { id: 'flights', title: 'Book Flights', icon: '✈️', description: 'Find best prices and book flights' },
  { id: 'hotels', title: 'Book Hotels', icon: '🏨', description: 'Family-friendly accommodations' },
  { id: 'visa-docs', title: 'Visa & Documents', icon: '📄', description: 'Visa, passport, insurance' },
  { id: 'packing', title: 'Packing Lists', icon: '🎒', description: 'Kids & adult packing checklists' },
  { id: 'last-minute', title: 'Last Minute', icon: '⏰', description: 'Forex, SIM, offline maps' },
];

export function getStepStatus(stepId: string, completedSteps: string[], daysUntilTrip: number): 'locked' | 'pending' | 'in-progress' | 'completed' {
  if (completedSteps.includes(stepId)) return 'completed';
  const stepOrder = ['flights', 'hotels', 'visa-docs', 'packing', 'last-minute'];
  const stepIndex = stepOrder.indexOf(stepId);
  if (stepId === 'last-minute' && daysUntilTrip > 7) return 'locked';
  if (stepIndex > 0) {
    const previousStep = stepOrder[stepIndex - 1];
    if (!completedSteps.includes(previousStep) && stepId !== 'last-minute') return 'locked';
  }
  for (const step of stepOrder) {
    if (!completedSteps.includes(step)) {
      if (step === stepId) return 'in-progress';
      if (step === 'last-minute' && daysUntilTrip > 7) continue;
      break;
    }
  }
  return 'pending';
}

export function getFlightBookingAdvice(daysUntilTrip: number, isPeakSeason: boolean) {
  if (daysUntilTrip > 90) return { icon: '⏳', title: 'Too Early', message: 'Check again in 2-3 weeks', color: 'amber' };
  if (daysUntilTrip > 60) return { icon: '✅', title: 'Good Time', message: 'Best prices typically now', color: 'green' };
  if (daysUntilTrip > 30) {
    return isPeakSeason
      ? { icon: '🔴', title: 'Book Now!', message: 'Peak season - prices rising!', color: 'red' }
      : { icon: '🔔', title: 'Book Soon', message: 'Prices starting to rise', color: 'amber' };
  }
  return { icon: '🔴', title: 'Urgent!', message: 'Last minute = higher prices', color: 'red' };
}

export function isPeakSeason(destination: string, month: number): boolean {
  const peakSeasons: Record<string, number[]> = {
    'dubai': [11, 0, 1, 2, 3],
    'singapore': [5, 6, 11, 0],
    'thailand': [10, 11, 0, 1, 2],
    'bali': [6, 7, 8, 11, 0],
    'maldives': [11, 0, 1, 2, 3],
  };
  const destLower = destination.toLowerCase();
  for (const [key, months] of Object.entries(peakSeasons)) {
    if (destLower.includes(key)) return months.includes(month);
  }
  return false;
}

export function getEmergencyContacts(country: string) {
  const contacts: Record<string, any> = {
    'dubai': { police: '999', ambulance: '998', embassy: 'Indian Embassy Dubai', embassyPhone: '+971-4-397-1222' },
    'singapore': { police: '999', ambulance: '995', embassy: 'Indian High Commission', embassyPhone: '+65-6737-6777' },
    'thailand': { police: '191', ambulance: '1669', embassy: 'Indian Embassy Bangkok', embassyPhone: '+66-2-258-0300' },
    'malaysia': { police: '999', ambulance: '999', embassy: 'Indian High Commission KL', embassyPhone: '+60-3-2093-3510' },
    'bali': { police: '110', ambulance: '118', embassy: 'Indian Consulate Bali', embassyPhone: '+62-361-473-498' },
  };
  const countryLower = country.toLowerCase();
  for (const [key, info] of Object.entries(contacts)) {
    if (countryLower.includes(key)) return info;
  }
  return { police: '112', ambulance: '112', embassy: 'Nearest Indian Embassy', embassyPhone: 'www.mea.gov.in' };
}

export function getDefaultStageData() {
  return {
    pre_trip: {
      completed_steps: [],
      flights: null,
      hotels: null,
      visa_status: 'pending',
      packing_progress: { kids: 0, adults: 0 },
    },
    during_trip: {
      daily_notes: [],
      memories: [],
      expenses: [],
    },
    post_trip: {
      rating: null,
      total_spent: 0,
      feedback: null,
    },
  };
}
