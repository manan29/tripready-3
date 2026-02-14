'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, MapPin, Utensils, Sparkles, Clock, Trash2, ExternalLink } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface Activity {
  id: string
  title: string
  description: string | null
  date: string | null
  location: string | null
  external_url: string | null
  estimated_cost: number | null
  currency: string
  type: 'activity' | 'place' | 'restaurant'
  time: string | null
}

interface ItineraryTabProps {
  tripId: string
  userId: string
  startDate: string
  endDate: string
}

export function ItineraryTab({ tripId, userId, startDate, endDate }: ItineraryTabProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [addingToDay, setAddingToDay] = useState<string | null>(null)
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'activity' as 'activity' | 'place' | 'restaurant',
    time: '',
    location: '',
    description: '',
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
      .order('time', { ascending: true })

    setActivities(data || [])
    setIsLoading(false)
  }

  async function addActivity(date: string) {
    if (!newActivity.title.trim()) return

    const { data, error } = await supabase
      .from('activities')
      .insert({
        trip_id: tripId,
        user_id: userId,
        title: newActivity.title,
        description: newActivity.description || null,
        date: date,
        time: newActivity.time || null,
        location: newActivity.location || null,
        type: newActivity.type,
        status: 'planned',
        currency: 'INR',
      })
      .select()
      .single()

    if (data) {
      setActivities([...activities, data])
      setNewActivity({
        title: '',
        type: 'activity',
        time: '',
        location: '',
        description: '',
      })
      setAddingToDay(null)
    }
  }

  async function deleteActivity(activityId: string) {
    setActivities(activities.filter(a => a.id !== activityId))
    await supabase.from('activities').delete().eq('id', activityId)
  }

  // Generate day-by-day itinerary
  const days: { date: string; dayNumber: number; activities: Activity[] }[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  let currentDate = new Date(start)
  let dayNum = 1

  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0]
    const dayActivities = activities.filter(a => a.date === dateString)

    days.push({
      date: dateString,
      dayNumber: dayNum,
      activities: dayActivities,
    })

    currentDate.setDate(currentDate.getDate() + 1)
    dayNum++
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'place':
        return <MapPin className="h-4 w-4" />
      case 'restaurant':
        return <Utensils className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'place':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'restaurant':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'place':
        return 'Place to Visit'
      case 'restaurant':
        return 'Restaurant'
      default:
        return 'Activity'
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading itinerary...</div>
  }

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div key={day.date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Day Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Day {day.dayNumber}</h3>
                <p className="text-white/80 text-sm">{formatDate(day.date)}</p>
              </div>
              <div className="text-white/80 text-sm">
                {day.activities.length} {day.activities.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Activities List */}
            <div className="space-y-3 mb-4">
              {day.activities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border',
                    getTypeColor(activity.type)
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {activity.time && (
                            <span className="flex items-center gap-1 text-xs font-medium">
                              <Clock className="h-3 w-3" />
                              {activity.time}
                            </span>
                          )}
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
                            {getTypeLabel(activity.type)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        {activity.location && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.location}
                          </p>
                        )}
                        {activity.external_url && (
                          <a
                            href={activity.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1"
                          >
                            View details <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {day.activities.length === 0 && addingToDay !== day.date && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No activities planned for this day yet
                </div>
              )}
            </div>

            {/* Add Activity Form */}
            {addingToDay === day.date ? (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                <div className="flex gap-2">
                  {['activity', 'place', 'restaurant'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewActivity({ ...newActivity, type: type as any })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        newActivity.type === type
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {type === 'activity' && '✨ Activity'}
                      {type === 'place' && '📍 Place'}
                      {type === 'restaurant' && '🍴 Restaurant'}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary-500"
                  />
                </div>

                <textarea
                  placeholder="Description (optional)"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary-500 resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => addActivity(day.date)}
                    className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingToDay(null)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setAddingToDay(day.date)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Activity
                </button>
                <button
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  View Suggestions
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {days.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No days to display. Please check your trip dates.</p>
        </div>
      )}
    </div>
  )
}
