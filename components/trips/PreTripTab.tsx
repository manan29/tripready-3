'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Pencil, X, Plane, Hotel } from 'lucide-react'
import { cn } from '@/lib/utils'
import DocumentManager from './DocumentManager'
import FlightLookup from './FlightLookup'

interface ChecklistItem {
  id: string
  title: string
  category: string
  is_completed: boolean
}

interface PreTripTabProps {
  tripId: string
  userId: string
}

const packingCategories = [
  { id: 'clothes', label: 'Clothes', icon: '👕' },
  { id: 'medicines', label: 'Medicines', icon: '💊' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'toiletries', label: 'Toiletries', icon: '🧴' },
  { id: 'kids_items', label: 'Kids Items', icon: '🧸' },
  { id: 'documents', label: 'Documents', icon: '📄' },
]

export function PreTripTab({ tripId, userId }: PreTripTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [activeCategory, setActiveCategory] = useState('clothes')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [showFlightLookup, setShowFlightLookup] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadItems()
    loadBookings()
  }, [tripId])

  async function loadBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    setBookings(data || [])
  }

  async function loadItems() {
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('trip_id', tripId)
      .eq('phase', 'pre-trip')
      .order('sort_order')

    setItems(data || [])
    setIsLoading(false)
  }

  async function toggleItem(itemId: string, isCompleted: boolean) {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, is_completed: !isCompleted } : item
    ))

    await supabase
      .from('checklist_items')
      .update({ is_completed: !isCompleted })
      .eq('id', itemId)
  }

  async function addItem() {
    if (!newItemTitle.trim()) return

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        trip_id: tripId,
        user_id: userId,
        title: newItemTitle,
        phase: 'pre-trip',
        category: activeCategory,
        is_template: false,
      })
      .select()
      .single()

    if (data) {
      setItems([...items, data])
      setNewItemTitle('')
      setIsAdding(false)
    }
  }

  async function deleteItem(itemId: string) {
    setItems(items.filter(item => item.id !== itemId))
    await supabase.from('checklist_items').delete().eq('id', itemId)
  }

  async function startEdit(item: ChecklistItem) {
    setEditingId(item.id)
    setEditText(item.title)
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return

    setItems(items.map(item =>
      item.id === editingId ? { ...item, title: editText } : item
    ))

    await supabase
      .from('checklist_items')
      .update({ title: editText })
      .eq('id', editingId)

    setEditingId(null)
    setEditText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  const filteredItems = items.filter(item => item.category === activeCategory)

  const categoryStats = packingCategories.map(cat => {
    const catItems = items.filter(item => item.category === cat.id)
    const completed = catItems.filter(item => item.is_completed).length
    return { ...cat, total: catItems.length, completed }
  })

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  const totalItems = items.length
  const completedItems = items.filter((item) => item.is_completed).length
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Packing List Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">📦 Packing List</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-primary">{completedItems}</span> of{' '}
              <span className="font-semibold">{totalItems}</span> packed
            </div>
            <div className="text-xs text-gray-500">{progressPercentage}% complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {categoryStats.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              {category.total > 0 && (
                <span
                  className={cn(
                    'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                    activeCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {category.completed}/{category.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group border-2',
                item.is_completed
                  ? 'bg-green-50 border-green-200 scale-[0.98]'
                  : 'bg-white border-gray-200 hover:border-primary-200 hover:shadow-sm'
              )}
            >
              {editingId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                    className="flex-1 px-3 py-2 border-2 border-primary-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-500 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-all"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleItem(item.id, item.is_completed)}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform flex-shrink-0',
                      item.is_completed
                        ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white scale-110 shadow-md'
                        : 'border-gray-300 hover:border-primary-500 hover:scale-110 active:scale-95'
                    )}
                  >
                    {item.is_completed && (
                      <Check className="h-4 w-4 animate-in zoom-in duration-200" />
                    )}
                  </button>
                  <span
                    className={cn(
                      'flex-1 text-sm transition-all duration-300',
                      item.is_completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900 font-medium'
                    )}
                  >
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add Item */}
          {isAdding ? (
            <div className="flex gap-2 p-3 bg-primary-50 rounded-xl border-2 border-primary-200">
              <input
                type="text"
                placeholder="Add item..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                autoFocus
                className="flex-1 outline-none text-sm bg-white px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <button
                onClick={addItem}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-lg hover:opacity-90 transition-all font-medium shadow-sm"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewItemTitle('')
                }}
                className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 p-4 w-full text-left text-gray-500 hover:text-primary hover:bg-primary-50 rounded-xl transition-all border-2 border-dashed border-gray-300 hover:border-primary-300 group"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Add item to {packingCategories.find(c => c.id === activeCategory)?.label}</span>
            </button>
          )}
        </div>

        {filteredItems.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-400">
            No items in this category yet
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">✈️ Bookings</h2>
          <button
            onClick={() => setShowFlightLookup(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Flight
          </button>
        </div>

        {/* Flights */}
        <div className="space-y-3">
          {bookings.filter(b => b.type === 'flight').length > 0 ? (
            bookings
              .filter(b => b.type === 'flight')
              .map((booking) => (
                <div key={booking.id} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{booking.title}</h3>
                    </div>
                  </div>

                  {booking.details && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {booking.details.departure?.iata || 'DEP'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {booking.details.departure?.airport || 'Departure'}
                          </div>
                          {booking.details.departure?.time && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(booking.details.departure.time).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 px-3">
                          <div className="h-px w-8 bg-blue-300" />
                          <Plane className="h-4 w-4 text-blue-500" />
                          <div className="h-px w-8 bg-blue-300" />
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {booking.details.arrival?.iata || 'ARR'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {booking.details.arrival?.airport || 'Arrival'}
                          </div>
                          {booking.details.arrival?.time && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(booking.details.arrival.time).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-gray-600 mt-3 pt-3 border-t border-blue-200">
                        {booking.details.pnr && (
                          <div>
                            PNR: <span className="font-mono font-semibold">{booking.details.pnr}</span>
                          </div>
                        )}
                        {booking.details.seatNumber && (
                          <div>
                            Seat: <span className="font-semibold">{booking.details.seatNumber}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
          ) : (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
              <Plane className="h-8 w-8 text-blue-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">No flights added yet</p>
              <button
                onClick={() => setShowFlightLookup(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Flight Booking
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <DocumentManager tripId={tripId} />
      </div>

      {/* Flight Lookup Modal */}
      {showFlightLookup && (
        <FlightLookup
          tripId={tripId}
          onFlightAdded={() => {
            loadBookings()
            setShowFlightLookup(false)
          }}
          onClose={() => setShowFlightLookup(false)}
        />
      )}
    </div>
  )
}
