import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Plane, LogOut, CheckCircle, Wallet, MapPin, Sparkles } from 'lucide-react'
import { TripCard } from '@/components/trips/TripCard'
import { AISearchBar } from '@/components/trips/AISearchBar'

export default async function TripsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's trips
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: true })

  // Get checklist completion for each trip
  const tripsWithProgress = await Promise.all(
    (trips || []).map(async (trip) => {
      const { data: items } = await supabase
        .from('checklist_items')
        .select('is_completed')
        .eq('trip_id', trip.id)

      const total = items?.length || 0
      const completed = items?.filter(i => i.is_completed).length || 0
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0

      return { ...trip, progress }
    })
  )

  const firstName = profile?.display_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-7 w-7 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">TripReady</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {profile?.avatar_url && (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-600 hidden sm:block">
                  {profile?.display_name || user.email}
                </span>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome + AI Search */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-500 mb-6">Plan your next family adventure</p>

          {/* AI Search Bar */}
          <AISearchBar />
        </div>

        {/* Feature Cards */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-700 text-center mb-6">
            What TripReady does for you
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Checklists</h3>
              <p className="text-sm text-gray-500">
                Pre-built lists based on your kids' ages
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Budget Tracking</h3>
              <p className="text-sm text-gray-500">
                Track expenses and upload receipts
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Kid-Friendly Activities</h3>
              <p className="text-sm text-gray-500">
                Discover activities for your children
              </p>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Trips</h2>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Manually
          </Link>
        </div>

        {/* Trips Grid */}
        {tripsWithProgress && tripsWithProgress.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tripsWithProgress.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Use the AI search above to create your first trip, or create one manually.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
