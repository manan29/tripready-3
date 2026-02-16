'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Check, Trash2, Loader2 } from 'lucide-react'

interface PackingSectionProps {
  tripId: string
  destination: string
  numKids: number
  kidAges?: number[]
}

interface PackingItem {
  id: string
  title: string
  category: string
  is_packed: boolean
}

export default function PackingSection({ tripId, destination, numKids, kidAges }: PackingSectionProps) {
  const supabase = createClient()
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = [
    'All',
    'Clothes',
    'Toiletries',
    'Electronics',
    'Documents',
    'Medicines',
    'Kids',
  ]

  useEffect(() => {
    fetchPackingItems()
  }, [tripId])

  const fetchPackingItems = async () => {
    const { data, error } = await supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('category', { ascending: true })

    if (data) setItems(data)
    setLoading(false)
  }

  const generatePackingList = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, duration: 5, numAdults: 2, numKids, kidAges }),
      })

      const data = await response.json()

      if (data.categories) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const newItems = data.categories.flatMap((cat: any) =>
          cat.items.map((item: string, index: number) => ({
            trip_id: tripId,
            user_id: user?.id,
            title: item,
            category: cat.name,
            is_packed: false,
            sort_order: index,
          }))
        )

        await supabase.from('packing_items').insert(newItems)
        fetchPackingItems()
      }
    } catch (error) {
      console.error('Error generating packing list:', error)
    }
    setGenerating(false)
  }

  const toggleItem = async (item: PackingItem) => {
    const newStatus = !item.is_packed
    setItems(items.map((i) => (i.id === item.id ? { ...i, is_packed: newStatus } : i)))

    await supabase.from('packing_items').update({ is_packed: newStatus }).eq('id', item.id)
  }

  const addItem = async () => {
    if (!newItem.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('packing_items')
      .insert({
        trip_id: tripId,
        user_id: user?.id,
        title: newItem.trim(),
        category: activeCategory === 'All' ? 'Other' : activeCategory,
        is_packed: false,
      })
      .select()
      .single()

    if (data) {
      setItems([...items, data])
      setNewItem('')
    }
  }

  const deleteItem = async (id: string) => {
    setItems(items.filter((i) => i.id !== id))
    await supabase.from('packing_items').delete().eq('id', id)
  }

  const filteredItems =
    activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory)

  const packedCount = items.filter((i) => i.is_packed).length
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500 mb-4">No packing list yet</p>
        <button
          onClick={generatePackingList}
          disabled={generating}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Smart Packing List'
          )}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">
            {packedCount} of {items.length} packed
          </span>
          <span className="text-purple-600 font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <button
              onClick={() => toggleItem(item)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                item.is_packed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300'
              }`}
            >
              {item.is_packed && <Check className="w-4 h-4" />}
            </button>
            <span
              className={`flex-1 text-sm ${item.is_packed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
            >
              {item.title}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add item..."
          className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button onClick={addItem} className="p-2 bg-purple-500 text-white rounded-xl">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
