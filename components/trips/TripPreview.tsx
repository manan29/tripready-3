'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, MapPin, Calendar, Users, Wallet, Loader2 } from 'lucide-react'
import { formatDate, formatCurrency, getTripVisuals } from '@/lib/utils'

interface TripData {
  destination: string
  start_date: string
  end_date: string
  adults: number
  kids: number
  kid_ages: number[]
  budget: number | null
  currency: string
}

interface TripPreviewProps {
  trip: TripData
  onClose: () => void
}

export function TripPreview({ trip, onClose }: TripPreviewProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const { gradient, icon } = getTripVisuals(trip.destination)

  const handleCreate = async () => {
    setIsCreating(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsCreating(false)
      return
    }

    // Create the trip
    const { data: newTrip, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        adults: trip.adults,
        kids: trip.kids,
        kid_ages: trip.kid_ages,
        total_budget: trip.budget,
        currency: trip.currency,
      })
      .select()
      .single()

    if (tripError || !newTrip) {
      console.error('Error creating trip:', tripError)
      setIsCreating(false)
      return
    }

    // Fetch and insert checklist templates based on kid ages
    const minKidAge = trip.kids > 0 ? Math.min(...trip.kid_ages) : null
    const maxKidAge = trip.kids > 0 ? Math.max(...trip.kid_ages) : null

    const { data: templates } = await supabase
      .from('checklist_templates')
      .select('*')
      .order('sort_order')

    if (templates && templates.length > 0) {
      const applicableTemplates = templates.filter((template: any) => {
        if (template.kid_age_min === null && template.kid_age_max === null) {
          return true
        }
        if (trip.kids === 0) {
          return template.kid_age_min === null && template.kid_age_max === null
        }
        const templateMin = template.kid_age_min ?? 0
        const templateMax = template.kid_age_max ?? 18
        return minKidAge !== null && maxKidAge !== null &&
          minKidAge <= templateMax && maxKidAge >= templateMin
      })

      const checklistItems = applicableTemplates.map((template: any) => ({
        trip_id: newTrip.id,
        user_id: user.id,
        title: template.title,
        phase: template.phase,
        category: template.category,
        is_template: true,
        sort_order: template.sort_order,
      }))

      if (checklistItems.length > 0) {
        await supabase.from('checklist_items').insert(checklistItems)
      }
    }

    router.push(`/trips/${newTrip.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
          <span className="text-5xl mb-2 block">{icon}</span>
          <h2 className="text-2xl font-bold">{trip.destination}</h2>
          <p className="text-white/80 text-sm">Trip Preview</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Dates</p>
              <p className="font-semibold text-gray-900">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Travelers</p>
              <p className="font-semibold text-gray-900">
                {trip.adults} Adult{trip.adults !== 1 ? 's' : ''}
                {trip.kids > 0 && ` + ${trip.kids} Kid${trip.kids !== 1 ? 's' : ''}`}
                {trip.kids > 0 && (
                  <span className="text-gray-600 text-sm ml-1">
                    (ages: {trip.kid_ages.join(', ')})
                  </span>
                )}
              </p>
            </div>
          </div>

          {trip.budget && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Budget</p>
                <p className="font-semibold text-gray-900">{formatCurrency(trip.budget, trip.currency)}</p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-purple-900 font-medium">
              We'll create smart checklists based on your kids' ages and destination.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Edit Details
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Trip'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
