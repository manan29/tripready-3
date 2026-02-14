import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency, daysUntil, tripDuration, getTripVisuals } from '@/lib/utils'
import { PreTripTab } from '@/components/trips/PreTripTab'
import { ItineraryTab } from '@/components/trips/ItineraryTab'
import { BudgetTab } from '@/components/trips/BudgetTab'
import { PostTripTab } from '@/components/trips/PostTripTab'
import { TripTabs } from '@/components/trips/TripTabs'

interface PageProps {
  params: Promise<{ tripId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function TripDetailPage({ params, searchParams }: PageProps) {
  const { tripId } = await params
  const { tab = 'pre-trip' } = await searchParams

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (error || !trip) {
    notFound()
  }

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('id, is_completed, phase')
    .eq('trip_id', tripId)

  const totalItems = checklistItems?.length || 0
  const completedItems = checklistItems?.filter((item: any) => item.is_completed).length || 0
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('trip_id', tripId)

  const totalSpent = expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) || 0

  const days = daysUntil(trip.start_date)
  const duration = tripDuration(trip.start_date, trip.end_date)
  const { gradient, icon } = getTripVisuals(trip.destination)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <header className={`bg-gradient-to-br ${gradient}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/trips"
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{icon}</span>
                <h1 className="text-2xl font-bold text-white">{trip.destination}</h1>
                <span className="text-white/80 text-lg">• {trip.country || 'International'}</span>
              </div>
              <p className="text-white/70 text-sm">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Top Bar Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Days to Go */}
            <div className="flex items-center gap-2">
              <div className="text-center px-4 py-2 bg-primary-50 rounded-xl">
                <div className="text-xl font-bold text-primary-600">
                  {days < 0 ? 'Completed' : days === 0 ? 'Today!' : `${days} days to go`}
                </div>
                {days > 0 && (
                  <div className="text-xs text-primary-600/70">
                    {formatDate(trip.start_date)}
                  </div>
                )}
                {days < 0 && (
                  <div className="text-xs text-primary-600/70">Trip finished</div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
              <div className="text-sm font-medium text-blue-900">Duration</div>
              <div className="text-lg font-bold text-blue-600">{duration} days</div>
            </div>

            {/* Weather Placeholder */}
            <div className="text-center px-4 py-2 bg-orange-50 rounded-xl">
              <div className="text-sm font-medium text-orange-900">Weather</div>
              <div className="text-lg font-bold text-orange-600">28°C ☀️</div>
            </div>

            {/* Currency Converter */}
            <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
              <div className="text-sm font-medium text-green-900">Currency</div>
              <div className="text-lg font-bold text-green-600">
                {trip.currency === 'AED' && '1 AED = ₹22.8'}
                {trip.currency === 'USD' && '1 USD = ₹83.2'}
                {trip.currency === 'EUR' && '1 EUR = ₹90.5'}
                {trip.currency === 'SGD' && '1 SGD = ₹62.1'}
                {trip.currency === 'THB' && '1 THB = ₹2.4'}
                {trip.currency === 'MYR' && '1 MYR = ₹18.8'}
                {trip.currency === 'INR' && '₹ INR'}
                {!['AED', 'USD', 'EUR', 'SGD', 'THB', 'MYR', 'INR'].includes(trip.currency) &&
                  `1 ${trip.currency} = ₹--`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TripTabs tripId={tripId} activeTab={tab} />

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {tab === 'pre-trip' && <PreTripTab tripId={tripId} userId={user.id} />}
        {tab === 'itinerary' && <ItineraryTab tripId={tripId} userId={user.id} startDate={trip.start_date} endDate={trip.end_date} />}
        {tab === 'budget' && <BudgetTab tripId={tripId} userId={user.id} currency={trip.currency} totalBudget={trip.total_budget} />}
        {tab === 'post-trip' && <PostTripTab tripId={tripId} userId={user.id} currency={trip.currency} totalBudget={trip.total_budget} />}
      </div>
    </div>
  )
}
