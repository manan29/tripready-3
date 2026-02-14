'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Pencil, X, Plane, Hotel, FileText, ShieldCheck, CreditCard, Car, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const documentTypes = [
  { id: 'insurance', label: 'Travel Insurance', icon: ShieldCheck, color: 'bg-blue-500' },
  { id: 'license', label: 'Driving License', icon: Car, color: 'bg-green-500' },
  { id: 'visa', label: 'Visa', icon: FileText, color: 'bg-purple-500' },
  { id: 'passport', label: 'Passport', icon: Briefcase, color: 'bg-orange-500' },
]

export function PreTripTab({ tripId, userId }: PreTripTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [activeCategory, setActiveCategory] = useState('clothes')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadItems()
  }, [tripId])

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

  return (
    <div className="space-y-6">
      {/* Packing List Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Packing List</h2>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categoryStats.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === category.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              {category.total > 0 && (
                <span className="ml-1 text-xs opacity-75">
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
                'flex items-center gap-3 p-3 rounded-xl transition-all group border',
                item.is_completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
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
                    className="flex-1 px-2 py-1 border border-primary-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-500 hover:text-green-600 p-1"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleItem(item.id, item.is_completed)}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                      item.is_completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary-500'
                    )}
                  >
                    {item.is_completed && <Check className="h-4 w-4" />}
                  </button>
                  <span className={cn(
                    'flex-1 text-sm',
                    item.is_completed && 'line-through text-gray-400'
                  )}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
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
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="text"
                placeholder="Add item..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                autoFocus
                className="flex-1 outline-none text-sm bg-transparent"
              />
              <button
                onClick={addItem}
                className="px-3 py-1 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewItemTitle('') }}
                className="px-3 py-1 text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 p-3 w-full text-left text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-dashed border-gray-300"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Add item</span>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">✈️ Bookings</h2>

        {/* Flights */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Flights</h3>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">PNR: <span className="font-mono font-semibold">ABC123XYZ</span></div>
            <div className="text-sm text-gray-600">Seats: <span className="font-semibold">12A, 12B, 12C</span></div>
            <button className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium">
              + Add Flight Booking
            </button>
          </div>
        </div>

        {/* Hotels */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hotel className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Hotels</h3>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="text-sm text-gray-600 mb-1">
              Booking: <span className="font-mono font-semibold">#HTL456789</span>
            </div>
            <div className="text-sm text-gray-600">Hotel Grand Plaza</div>
            <button className="mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium">
              + Add Hotel Booking
            </button>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Documents</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {documentTypes.map((doc) => {
            const Icon = doc.icon
            return (
              <div
                key={doc.id}
                className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
              >
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-2', doc.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-gray-600 text-center">{doc.label}</span>
                <span className="text-xs text-green-600 mt-1">✓ Added</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
