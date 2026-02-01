import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency, daysUntil, tripDuration, getTripVisuals } from '@/lib/utils'
import { ChecklistTab } from '@/components/trips/ChecklistTab'
import { BudgetTab } from '@/components/trips/BudgetTab'
import { ActivitiesTab } from '@/components/trips/ActivitiesTab'
import { FlightsTab } from '@/components/trips/FlightsTab'
import { TripTabs } from '@/components/trips/TripTabs'

interface PageProps {
  params: Promise<{ tripId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function TripDetailPage({ params, searchParams }: PageProps) {
  const { tripId } = await params
  const { tab = 'checklist' } = await searchParams

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/trips"
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                <h1 className="text-xl font-bold">{trip.destination}</h1>
              </div>
              <p className="text-white/80 text-sm">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-600">
                {days < 0 ? 'Past' : days === 0 ? '🎉' : days}
              </div>
              <div className="text-xs text-primary-600/70">
                {days < 0 ? 'trip' : days === 0 ? 'Today!' : 'days to go'}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-100 rounded-xl">
              <div className="text-2xl font-bold text-gray-700">{duration}</div>
              <div className="text-xs text-gray-500">days trip</div>
            </div>

            <div className="text-center p-3 bg-gray-100 rounded-xl">
              <div className="text-2xl font-bold text-gray-700">
                {trip.adults + trip.kids}
              </div>
              <div className="text-xs text-gray-500">
                {trip.adults}A + {trip.kids}K
              </div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{progress}%</div>
              <div className="text-xs text-green-600/70">prepared</div>
            </div>
          </div>

          {trip.total_budget && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium">
                  {formatCurrency(totalSpent, trip.currency)} / {formatCurrency(trip.total_budget, trip.currency)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalSpent > trip.total_budget ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${Math.min(100, (totalSpent / trip.total_budget) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TripTabs tripId={tripId} activeTab={tab} />

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {tab === 'checklist' && <ChecklistTab tripId={tripId} userId={user.id} />}
        {tab === 'budget' && <BudgetTab tripId={tripId} userId={user.id} currency={trip.currency} />}
        {tab === 'activities' && <ActivitiesTab tripId={tripId} userId={user.id} />}
        {tab === 'flights' && <FlightsTab tripId={tripId} userId={user.id} />}
      </div>
    </div>
  )
}
