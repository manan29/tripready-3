'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Receipt } from 'lucide-react'

interface BudgetSectionProps {
  tripId: string
  currency?: { from: string; rate: number }
}

export default function BudgetSection({ tripId, currency }: BudgetSectionProps) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Food' })

  const categories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Other']

  useEffect(() => {
    fetchExpenses()
  }, [tripId])

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (data) setExpenses(data)
    setLoading(false)
  }

  const addExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('expenses').insert({
      trip_id: tripId,
      user_id: user?.id,
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
    })

    if (!error) {
      fetchExpenses()
      setNewExpense({ title: '', amount: '', category: 'Food' })
      setShowForm(false)
    }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading...</div>
  }

  return (
    <div>
      {/* Total */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4 text-white">
        <p className="text-sm opacity-80">Total Spent</p>
        <p className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</p>
        {currency && (
          <p className="text-xs opacity-70 mt-1">
            ≈ {(totalSpent / currency.rate).toFixed(2)} {currency.from}
          </p>
        )}
      </div>

      {/* Add Expense Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-purple-200 rounded-xl text-purple-500 font-medium flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-5 h-5" /> Add Expense
        </button>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-purple-50 rounded-2xl p-4 mb-4">
          <input
            type="text"
            value={newExpense.title}
            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            placeholder="What did you spend on?"
            className="w-full px-3 py-2 bg-white rounded-xl text-sm outline-none mb-2"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              placeholder="Amount (₹)"
              className="flex-1 px-3 py-2 bg-white rounded-xl text-sm outline-none"
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="px-3 py-2 bg-white rounded-xl text-sm outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-gray-200 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addExpense}
              className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-sm"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Expense List */}
      {expenses.length > 0 ? (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{expense.title}</p>
                  <p className="text-xs text-gray-500">{expense.category}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">₹{expense.amount?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && <p className="text-gray-400 text-sm text-center py-4">No expenses recorded yet</p>
      )}
    </div>
  )
}
