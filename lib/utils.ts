import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function tripDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

// Trip card visuals based on destination
export function getTripVisuals(destination: string): { gradient: string; icon: string } {
  const dest = destination.toLowerCase()

  // Beach/Tropical
  if (['thailand', 'bali', 'maldives', 'goa', 'phuket', 'hawaii', 'fiji', 'mauritius', 'sri lanka', 'andaman'].some(d => dest.includes(d))) {
    return { gradient: 'from-blue-400 to-cyan-300', icon: '🌴' }
  }

  // City/Urban
  if (['singapore', 'hong kong', 'tokyo', 'new york', 'london', 'mumbai', 'delhi', 'bangalore', 'seoul', 'shanghai'].some(d => dest.includes(d))) {
    return { gradient: 'from-purple-500 to-pink-400', icon: '🏙️' }
  }

  // Mountain/Nature
  if (['switzerland', 'nepal', 'himachal', 'manali', 'ladakh', 'new zealand', 'bhutan', 'kashmir', 'shimla', 'darjeeling'].some(d => dest.includes(d))) {
    return { gradient: 'from-green-500 to-teal-400', icon: '⛰️' }
  }

  // Desert/Middle East
  if (['dubai', 'abu dhabi', 'qatar', 'egypt', 'rajasthan', 'jaisalmer', 'saudi', 'oman', 'jordan'].some(d => dest.includes(d))) {
    return { gradient: 'from-orange-400 to-yellow-300', icon: '☀️' }
  }

  // Europe
  if (['paris', 'rome', 'spain', 'italy', 'france', 'germany', 'amsterdam', 'prague', 'vienna', 'greece', 'portugal'].some(d => dest.includes(d))) {
    return { gradient: 'from-blue-500 to-indigo-400', icon: '🏰' }
  }

  // Australia/NZ
  if (['australia', 'sydney', 'melbourne', 'auckland', 'queensland'].some(d => dest.includes(d))) {
    return { gradient: 'from-amber-400 to-orange-300', icon: '🦘' }
  }

  // USA
  if (['usa', 'america', 'california', 'florida', 'las vegas', 'miami', 'san francisco', 'los angeles'].some(d => dest.includes(d))) {
    return { gradient: 'from-red-400 to-blue-400', icon: '🗽' }
  }

  // Default
  return { gradient: 'from-primary-400 to-primary-600', icon: '✈️' }
}
