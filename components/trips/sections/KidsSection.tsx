'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Check, Trash2, Baby, Pill, Shirt, Gamepad2 } from 'lucide-react'

interface KidsSectionProps {
  tripId: string
  numKids: number
  kidAges?: number[]
}

interface PackingItem {
  id: string
  title: string
  category: string
  is_packed: boolean
}

export default function KidsSection({ tripId, numKids, kidAges }: KidsSectionProps) {
  const supabase = createClient()
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Kids-specific categories
  const kidsCategories = [
    { name: 'All', icon: Baby, color: 'purple' },
    { name: 'Kids Medicines', icon: Pill, color: 'red' },
    { name: 'Kids Clothes', icon: Shirt, color: 'blue' },
    { name: 'Kids Entertainment', icon: Gamepad2, color: 'green' },
    { name: 'Kids Essentials', icon: Baby, color: 'purple' },
  ]

  useEffect(() => {
    fetchKidsItems()
  }, [tripId])

  const fetchKidsItems = async () => {
    const { data, error } = await supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .or('category.eq.Kids Essentials,category.eq.Kids Medicines,category.eq.Kids Clothes,category.eq.Kids Entertainment')
      .order('category', { ascending: true })

    if (data) setItems(data)
    setLoading(false)
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
        category: activeCategory === 'All' ? 'Kids Essentials' : activeCategory,
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

  const getAgeGroup = (age: number) => {
    if (age < 1) return 'Infant'
    if (age <= 3) return 'Toddler'
    if (age <= 8) return 'Young kid'
    if (age <= 12) return 'Pre-teen'
    return 'Teen'
  }

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading...</div>
  }

  if (numKids === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">No kids on this trip</p>
      </div>
    )
  }

  return (
    <div>
      {/* Kids Info Header */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Baby className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">
            {numKids} {numKids === 1 ? 'Kid' : 'Kids'} Traveling
          </h3>
        </div>
        {kidAges && kidAges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {kidAges.map((age, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-white/80 rounded-full text-sm text-purple-700 font-medium"
              >
                {age} {age === 1 ? 'year' : 'years'} ({getAgeGroup(age)})
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-purple-600 mt-2">
          ✨ Age-specific essentials curated just for your kids
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-gray-500 mb-2">No kids items yet</p>
          <p className="text-xs text-gray-400">
            Generate a packing list from the modal to see age-specific kids items
          </p>
        </div>
      ) : (
        <>
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
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {kidsCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeCategory === cat.name
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.name.replace('Kids ', '')}
                </button>
              )
            })}
          </div>

          {/* Items List by Category */}
          {activeCategory === 'All' ? (
            // Show grouped by category
            <div className="space-y-4">
              {kidsCategories.slice(1).map((cat) => {
                const categoryItems = items.filter((i) => i.category === cat.name)
                if (categoryItems.length === 0) return null

                const Icon = cat.icon
                return (
                  <div key={cat.name}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-semibold text-gray-700">
                        {cat.name.replace('Kids ', '')}
                      </h4>
                      <span className="text-xs text-gray-400">
                        ({categoryItems.filter((i) => i.is_packed).length}/{categoryItems.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {categoryItems.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          onToggle={toggleItem}
                          onDelete={deleteItem}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Show filtered items
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
              ))}
            </div>
          )}

          {/* Add Item */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add kids item..."
              className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button onClick={addItem} className="p-2 bg-purple-500 text-white rounded-xl">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Item Row Component
function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: PackingItem
  onToggle: (item: PackingItem) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl hover:bg-purple-50 transition-colors">
      <button
        onClick={() => onToggle(item)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.is_packed ? 'bg-green-500 border-green-500 text-white' : 'border-purple-300'
        }`}
      >
        {item.is_packed && <Check className="w-4 h-4" />}
      </button>
      <span
        className={`flex-1 text-sm ${item.is_packed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
      >
        {item.title}
      </span>
      <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500 p-1">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
