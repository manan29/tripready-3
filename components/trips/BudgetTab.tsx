'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, Receipt, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  receipt_url: string | null
  payment_method: string | null
}

interface BudgetTabProps {
  tripId: string
  userId: string
  currency: string
  totalBudget?: number
}

const categories = [
  { id: 'flights', label: 'Flights', color: 'bg-blue-500' },
  { id: 'accommodation', label: 'Accommodation', color: 'bg-purple-500' },
  { id: 'food', label: 'Food', color: 'bg-orange-500' },
  { id: 'transport', label: 'Transport', color: 'bg-green-500' },
  { id: 'activities', label: 'Activities', color: 'bg-pink-500' },
  { id: 'shopping', label: 'Shopping', color: 'bg-yellow-500' },
  { id: 'insurance', label: 'Insurance', color: 'bg-teal-500' },
  { id: 'visa', label: 'Visa', color: 'bg-indigo-500' },
  { id: 'other', label: 'Other', color: 'bg-gray-500' },
]

export function BudgetTab({ tripId, userId, currency, totalBudget }: BudgetTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'upi',
  })

  const supabase = createClient()

  useEffect(() => {
    loadExpenses()
  }, [tripId])

  async function loadExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: false })

    setExpenses(data || [])
    setIsLoading(false)
  }

  async function addExpense() {
    if (!newExpense.title.trim() || !newExpense.amount) return

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        user_id: userId,
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        payment_method: newExpense.payment_method,
        currency,
      })
      .select()
      .single()

    if (data) {
      setExpenses([data, ...expenses])
      setNewExpense({
        title: '',
        amount: '',
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'upi',
      })
      setIsAdding(false)
    }
  }

  async function deleteExpense(expenseId: string) {
    setExpenses(expenses.filter(e => e.id !== expenseId))
    await supabase.from('expenses').delete().eq('id', expenseId)
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: expenses
      .filter(e => e.category === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  })).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total)

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading expenses...</div>
  }

  const remaining = totalBudget ? totalBudget - totalSpent : 0
  const spentPercentage = totalBudget ? Math.min(100, (totalSpent / totalBudget) * 100) : 0

  return (
    <div>
      {/* Budget Overview Card */}
      {totalBudget && (
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 mb-6 text-white">
          <div className="text-center mb-4">
            <div className="text-white/80 text-sm mb-1">Total Budget</div>
            <div className="text-4xl font-bold mb-4">
              {formatCurrency(totalBudget, currency)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Spent: {formatCurrency(totalSpent, currency)}</span>
              <span>Remaining: {formatCurrency(remaining, currency)}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  totalSpent > totalBudget ? 'bg-red-400' : 'bg-white'
                )}
                style={{ width: `${spentPercentage}%` }}
              />
            </div>
            <div className="text-center text-xs mt-2 text-white/80">
              {spentPercentage.toFixed(1)}% of budget used
            </div>
          </div>

          {totalSpent > totalBudget && (
            <div className="bg-red-400/20 border border-red-300/30 rounded-lg p-3 text-center text-sm">
              ⚠️ You've exceeded your budget by {formatCurrency(totalSpent - totalBudget, currency)}
            </div>
          )}
        </div>
      )}

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryTotals.map((cat) => {
              const catPercentage = totalBudget ? (cat.total / totalBudget) * 100 : 0
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', cat.color)} />
                      <span className="text-sm text-gray-600">{cat.label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(cat.total, currency)}
                    </span>
                  </div>
                  {totalBudget && (
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-5">
                      <div
                        className={cn('h-full rounded-full', cat.color)}
                        style={{ width: `${catPercentage}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Expense Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors mb-6"
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      )}

      {/* Add Expense Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl p-5 mb-6 space-y-4">
          <input
            type="text"
            placeholder="What did you spend on?"
            value={newExpense.title}
            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
            />
          </div>

          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          <select
            value={newExpense.payment_method}
            onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
          >
            <option value="upi">UPI</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer">
            <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Upload Receipt</p>
            <p className="text-xs text-gray-400">Click or drag to upload</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addExpense}
              className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Save Expense
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

      {/* Expense List */}
      <div className="space-y-2">
        {expenses.map((expense) => {
          const category = categories.find(c => c.id === expense.category)
          return (
            <div
              key={expense.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl"
            >
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', category?.color || 'bg-gray-500')}>
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{expense.title}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(expense.date)} • {category?.label}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(expense.amount, currency)}
                </div>
              </div>
              <button
                onClick={() => deleteExpense(expense.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {expenses.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-400">
          No expenses recorded yet
        </div>
      )}
    </div>
  )
}
