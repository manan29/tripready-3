'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Plane, ArrowLeft, Plus, Minus } from 'lucide-react'

export default function NewTripPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    adults: 2,
    kids: 1,
    kid_ages: [3],
    total_budget: '',
    currency: 'INR',
  })

  const handleKidAgeChange = (index: number, value: number) => {
    const newAges = [...formData.kid_ages]
    newAges[index] = value
    setFormData({ ...formData, kid_ages: newAges })
  }

  const handleKidsChange = (delta: number) => {
    const newKids = Math.max(0, Math.min(6, formData.kids + delta))
    let newAges = [...formData.kid_ages]

    if (delta > 0) {
      newAges.push(3)
    } else if (delta < 0 && newAges.length > 0) {
      newAges.pop()
    }

    setFormData({ ...formData, kids: newKids, kid_ages: newAges })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a trip')
      setIsLoading(false)
      return
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        adults: formData.adults,
        kids: formData.kids,
        kid_ages: formData.kid_ages,
        total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null,
        currency: formData.currency,
      })
      .select()
      .single()

    if (tripError) {
      setError(tripError.message)
      setIsLoading(false)
      return
    }

    // Generate checklist from templates
    const minKidAge = formData.kids > 0 ? Math.min(...formData.kid_ages) : null
    const maxKidAge = formData.kids > 0 ? Math.max(...formData.kid_ages) : null

    const { data: templates } = await supabase
      .from('checklist_templates')
      .select('*')
      .order('sort_order')

    if (templates && templates.length > 0) {
      const applicableTemplates = templates.filter((template: any) => {
        if (template.kid_age_min === null && template.kid_age_max === null) {
          return true
        }
        if (formData.kids === 0) {
          return template.kid_age_min === null && template.kid_age_max === null
        }
        const templateMin = template.kid_age_min ?? 0
        const templateMax = template.kid_age_max ?? 18
        return minKidAge !== null && maxKidAge !== null &&
          minKidAge <= templateMax && maxKidAge >= templateMin
      })

      const checklistItems = applicableTemplates.map((template: any) => ({
        trip_id: trip.id,
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

    router.push(`/trips/${trip.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/trips"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-2">
              <Plane className="h-7 w-7 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">New Trip</span>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where are you going?
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Singapore, Thailand, Dubai"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, adults: Math.max(1, formData.adults - 1) })}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{formData.adults}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, adults: Math.min(10, formData.adults + 1) })}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kids
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleKidsChange(-1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{formData.kids}</span>
                <button
                  type="button"
                  onClick={() => handleKidsChange(1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {formData.kids > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kid Ages
              </label>
              <div className="flex flex-wrap gap-3">
                {formData.kid_ages.map((age, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Kid {index + 1}:</span>
                    <select
                      value={age}
                      onChange={(e) => handleKidAgeChange(index, parseInt(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                    >
                      {Array.from({ length: 18 }, (_, i) => (
                        <option key={i} value={i}>{i} {i === 1 ? 'year' : 'years'}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Budget (optional)
            </label>
            <div className="flex gap-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="SGD">S$ SGD</option>
                <option value="AED">د.إ AED</option>
                <option value="THB">฿ THB</option>
              </select>
              <input
                type="number"
                placeholder="e.g., 200000"
                value={formData.total_budget}
                onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white py-4 rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Trip...' : 'Create Trip'}
          </button>
        </form>
      </div>
    </div>
  )
}
