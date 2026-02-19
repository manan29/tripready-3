'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Plus, Check, RefreshCw, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PackingItem {
  id: string
  name: string
  quantity: number
  reason?: string
  packed: boolean
  isCustom?: boolean
}

interface PackingCategory {
  category: string
  items: PackingItem[]
}

interface KidsTabProps {
  tripId: string
  trip: any
  numKids: number
  kidAges?: number[]
}

export function KidsTab({ tripId, trip, numKids, kidAges }: KidsTabProps) {
  const supabase = createClient()
  const [packingList, setPackingList] = useState<PackingCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('Kids Essentials')
  const [newItemQuantity, setNewItemQuantity] = useState(1)

  const categories = ['Kids Essentials', 'Kids Medicines', 'Kids Clothes', 'Kids Entertainment', 'Baby Gear']

  // Load existing items from database
  useEffect(() => {
    if (tripId) {
      loadPackingItems()
    }
  }, [tripId])

  const loadPackingItems = async () => {
    const { data } = await supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .in('category', ['Kids Essentials', 'Kids Medicines', 'Kids Clothes', 'Kids Entertainment', 'Baby Gear'])
      .order('category')

    if (data && data.length > 0) {
      // Group by category
      const grouped = data.reduce((acc: any, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push({
          id: item.id,
          name: item.title,
          quantity: 1,
          packed: item.is_packed,
          isCustom: true,
        })
        return acc
      }, {})

      const formatted = Object.keys(grouped).map((category) => ({
        category,
        items: grouped[category],
      }))

      setPackingList(formatted)
    }
  }

  // Generate AI list
  const generatePackingList = async () => {
    setLoading(true)
    try {
      const duration = Math.ceil(
        (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
      )

      const res = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination,
          country: trip.country,
          duration: duration || 5,
          numAdults: trip.num_adults || 2,
          numKids: numKids,
          kidAges: kidAges || [],
        }),
      })
      const data = await res.json()

      // Save to database
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (data.kids_items && user) {
        const itemsToInsert = data.kids_items.flatMap((cat: any) =>
          cat.items.map((itemName: string) => ({
            trip_id: tripId,
            user_id: user.id,
            title: itemName,
            category: cat.category,
            is_packed: false,
          }))
        )

        await supabase.from('packing_items').insert(itemsToInsert)
        await loadPackingItems()
      }
    } catch (error) {
      console.error('Failed to generate:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add custom item
  const addCustomItem = async () => {
    if (!newItemName.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('packing_items')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        title: newItemName.trim(),
        category: newItemCategory,
        is_packed: false,
      })
      .select()
      .single()

    if (data) {
      const newItem: PackingItem = {
        id: data.id,
        name: data.title,
        quantity: newItemQuantity,
        packed: false,
        isCustom: true,
      }

      setPackingList((prev) => {
        const existing = prev.find((cat) => cat.category === newItemCategory)
        if (existing) {
          return prev.map((cat) =>
            cat.category === newItemCategory ? { ...cat, items: [...cat.items, newItem] } : cat
          )
        } else {
          return [...prev, { category: newItemCategory, items: [newItem] }]
        }
      })
    }

    // Reset form
    setNewItemName('')
    setNewItemQuantity(1)
    setShowAddModal(false)
  }

  // Toggle packed status
  const togglePacked = async (categoryIdx: number, itemId: string) => {
    const category = packingList[categoryIdx]
    const item = category.items.find((i) => i.id === itemId)
    if (!item) return

    const newStatus = !item.packed
    await supabase.from('packing_items').update({ is_packed: newStatus }).eq('id', itemId)

    setPackingList((prev) =>
      prev.map((cat, cIdx) =>
        cIdx === categoryIdx
          ? {
              ...cat,
              items: cat.items.map((item) => (item.id === itemId ? { ...item, packed: newStatus } : item)),
            }
          : cat
      )
    )
  }

  // Delete item
  const deleteItem = async (categoryIdx: number, itemId: string) => {
    await supabase.from('packing_items').delete().eq('id', itemId)

    setPackingList((prev) =>
      prev
        .map((cat, cIdx) => (cIdx === categoryIdx ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) } : cat))
        .filter((cat) => cat.items.length > 0)
    )
  }

  const getAgeGroup = (age: number) => {
    if (age < 1) return 'Infant'
    if (age <= 3) return 'Toddler'
    if (age <= 8) return 'Young kid'
    if (age <= 12) return 'Pre-teen'
    return 'Teen'
  }

  const totalItems = packingList.reduce((sum, cat) => sum + cat.items.length, 0)
  const packedItems = packingList.reduce((sum, cat) => sum + cat.items.filter((item) => item.packed).length, 0)

  if (numKids === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👶</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No kids on this trip</h3>
        <p className="text-gray-500">This trip is for adults only</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Kids Info Header */}
      {kidAges && kidAges.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-purple-900">
              {numKids} {numKids === 1 ? 'Kid' : 'Kids'} Traveling
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {kidAges.map((age, idx) => (
              <div key={idx} className="px-3 py-1 bg-white/80 rounded-full text-sm text-purple-700 font-medium">
                {age} {age === 1 ? 'year' : 'years'} ({getAgeGroup(age)})
              </div>
            ))}
          </div>
          <p className="text-xs text-purple-600 mt-2">✨ Age-specific essentials curated just for your kids</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={generatePackingList}
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {packingList.length > 0 ? 'Regenerate Kids List' : 'Generate Smart Kids List'}
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-50"
        >
          <Plus className="w-5 h-5" />
          Add
        </button>
      </div>

      {/* Progress Bar */}
      {packingList.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Kids Packing Progress</span>
            <span className="text-purple-600 font-bold">
              {packedItems}/{totalItems}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: totalItems > 0 ? `${(packedItems / totalItems) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {packingList.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <p>No kids items yet.</p>
          <p className="text-sm mt-1">Generate a smart list or add items manually.</p>
        </div>
      )}

      {/* Packing Categories */}
      {packingList.map((category, catIdx) => (
        <div key={category.category} className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-purple-800 mb-3">{category.category}</h3>
          <div className="space-y-2">
            {category.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                  item.packed ? 'bg-green-50' : 'hover:bg-purple-50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => togglePacked(catIdx, item.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.packed ? 'bg-green-500 border-green-500 text-white' : 'border-purple-300'
                  }`}
                >
                  {item.packed && <Check className="w-3 h-3" />}
                </button>

                {/* Item details */}
                <div className="flex-1 cursor-pointer" onClick={() => togglePacked(catIdx, item.id)}>
                  <div className="flex items-center gap-2">
                    <span className={item.packed ? 'line-through text-gray-400' : 'text-gray-800'}>{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-xs bg-purple-100 px-1.5 py-0.5 rounded">×{item.quantity}</span>
                    )}
                  </div>
                  {item.reason && <p className="text-xs text-gray-400 mt-0.5">{item.reason}</p>}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteItem(catIdx, item.id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Kids Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Calpol syrup"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={addCustomItem}
                disabled={!newItemName.trim()}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
