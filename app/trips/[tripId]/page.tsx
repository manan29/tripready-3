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
import TripHeader from '@/components/trips/TripHeader'

interface PageProps {
  params: Promise<{ tripId: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { tripId } = await params
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('destination, country, start_date')
    .eq('id', tripId)
    .single()

  if (!trip) {
    return {
      title: 'Trip Not Found',
    }
  }

  return {
    title: `${trip.destination}${trip.country ? ', ' + trip.country : ''} Trip`,
    description: `Plan and manage your trip to ${trip.destination} starting ${new Date(
      trip.start_date
    ).toLocaleDateString()}`,
  }
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

      {/* Trip Header with Live Data */}
      <TripHeader
        destination={trip.destination}
        country={trip.country || ''}
        startDate={trip.start_date}
        endDate={trip.end_date}
        currency={trip.destination_currency || 'USD'}
      />

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
