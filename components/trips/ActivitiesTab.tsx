'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, MapPin, ExternalLink, Trash2, Calendar } from 'lucide-react'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

interface Activity {
  id: string
  title: string
  description: string | null
  date: string | null
  location: string | null
  external_url: string | null
  estimated_cost: number | null
  currency: string
  kid_friendly: boolean
  status: string
}

interface ActivitiesTabProps {
  tripId: string
  userId: string
}

export function ActivitiesTab({ tripId, userId }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    external_url: '',
    estimated_cost: '',
    kid_friendly: true,
  })

  const supabase = createClient()

  useEffect(() => {
    loadActivities()
  }, [tripId])

  async function loadActivities() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: true })

    setActivities(data || [])
    setIsLoading(false)
  }

  async function addActivity() {
    if (!newActivity.title.trim()) return

    const { data, error } = await supabase
      .from('activities')
      .insert({
        trip_id: tripId,
        user_id: userId,
        title: newActivity.title,
        description: newActivity.description || null,
        date: newActivity.date || null,
        location: newActivity.location || null,
        external_url: newActivity.external_url || null,
        estimated_cost: newActivity.estimated_cost ? parseFloat(newActivity.estimated_cost) : null,
        kid_friendly: newActivity.kid_friendly,
        status: 'planned',
        currency: 'INR',
      })
      .select()
      .single()

    if (data) {
      setActivities([...activities, data])
      setNewActivity({
        title: '',
        description: '',
        date: '',
        location: '',
        external_url: '',
        estimated_cost: '',
        kid_friendly: true,
      })
      setIsAdding(false)
    }
  }

  async function deleteActivity(activityId: string) {
    setActivities(activities.filter(a => a.id !== activityId))
    await supabase.from('activities').delete().eq('id', activityId)
  }

  async function updateStatus(activityId: string, status: string) {
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, status } : a
    ))
    await supabase.from('activities').update({ status }).eq('id', activityId)
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading activities...</div>
  }

  return (
    <div>
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors mb-6"
        >
          <Plus className="h-5 w-5" />
          Add Activity
        </button>
      )}

      {isAdding && (
        <div className="bg-white rounded-2xl p-5 mb-6 space-y-4">
          <input
            type="text"
            placeholder="Activity name"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          />

          <textarea
            placeholder="Description (optional)"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newActivity.date}
              onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
            <input
              type="number"
              placeholder="Est. cost (₹)"
              value={newActivity.estimated_cost}
              onChange={(e) => setNewActivity({ ...newActivity, estimated_cost: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
          </div>

          <input
            type="text"
            placeholder="Location"
            value={newActivity.location}
            onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          />

          <input
            type="url"
            placeholder="Booking URL (Klook, Viator, etc.)"
            value={newActivity.external_url}
            onChange={(e) => setNewActivity({ ...newActivity, external_url: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newActivity.kid_friendly}
              onChange={(e) => setNewActivity({ ...newActivity, kid_friendly: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Kid-friendly activity</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={addActivity}
              className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Save Activity
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {activity.description && (
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                  {activity.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(activity.date)}
                    </span>
                  )}
                  {activity.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activity.location}
                    </span>
                  )}
                  {activity.estimated_cost && (
                    <span>{formatCurrency(activity.estimated_cost, activity.currency)}</span>
                  )}
                  {activity.kid_friendly && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Kid-friendly
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <select
                    value={activity.status}
                    onChange={(e) => updateStatus(activity.id, e.target.value)}
                    className={cn(
                      'text-xs px-2 py-1 rounded-full border-0 outline-none',
                      activity.status === 'planned' && 'bg-gray-100 text-gray-600',
                      activity.status === 'booked' && 'bg-blue-100 text-blue-700',
                      activity.status === 'completed' && 'bg-green-100 text-green-700',
                      activity.status === 'cancelled' && 'bg-red-100 text-red-700'
                    )}
                  >
                    <option value="planned">Planned</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {activity.external_url && (
                    <a
                      href={activity.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    >
                      Book / View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-400">
          <p>No activities planned yet</p>
          <p className="text-sm mt-1">Add activities from Klook, Viator, or plan your own!</p>
        </div>
      )}
    </div>
  )
}
