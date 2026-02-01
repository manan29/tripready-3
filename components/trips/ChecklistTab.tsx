'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  title: string
  phase: string
  category: string
  is_completed: boolean
  is_template: boolean
}

interface ChecklistTabProps {
  tripId: string
  userId: string
}

const phases = [
  { id: 'pre-trip', label: 'Pre-Trip' },
  { id: 'during-trip', label: 'During' },
  { id: 'post-trip', label: 'Post-Trip' },
]

const categories = [
  'all', 'documents', 'packing', 'health', 'booking', 'shopping', 'transport', 'accommodation', 'other'
]

export function ChecklistTab({ tripId, userId }: ChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [activePhase, setActivePhase] = useState('pre-trip')
  const [activeCategory, setActiveCategory] = useState('all')
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
        phase: activePhase,
        category: activeCategory === 'all' ? 'other' : activeCategory,
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

  const filteredItems = items.filter(item => {
    if (item.phase !== activePhase) return false
    if (activeCategory !== 'all' && item.category !== activeCategory) return false
    return true
  })

  const phaseStats = phases.map(phase => {
    const phaseItems = items.filter(item => item.phase === phase.id)
    const completed = phaseItems.filter(item => item.is_completed).length
    return { ...phase, total: phaseItems.length, completed }
  })

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading checklist...</div>
  }

  return (
    <div>
      {/* Phase Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {phaseStats.map((phase) => (
          <button
            key={phase.id}
            onClick={() => setActivePhase(phase.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activePhase === phase.id
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            {phase.label}
            <span className="ml-2 text-xs opacity-75">
              {phase.completed}/{phase.total}
            </span>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors',
              activeCategory === category
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 p-3 bg-white rounded-xl transition-all group',
              item.is_completed && 'opacity-60'
            )}
          >
            {editingId === item.id ? (
              /* Edit Mode */
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
              /* View Mode */
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
          <div className="flex gap-2 p-3 bg-white rounded-xl">
            <input
              type="text"
              placeholder="Add a task..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              autoFocus
              className="flex-1 outline-none text-sm"
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
            className="flex items-center gap-2 p-3 w-full text-left text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add item</span>
          </button>
        )}
      </div>

      {filteredItems.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-400">
          No items in this category
        </div>
      )}
    </div>
  )
}
