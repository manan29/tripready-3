'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Receipt, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

interface PostTripTabProps {
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

export function PostTripTab({ tripId, userId, currency, totalBudget }: PostTripTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const budgetDifference = totalBudget ? totalBudget - totalSpent : 0
  const isOverBudget = budgetDifference < 0

  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: expenses
      .filter(e => e.category === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0),
    count: expenses.filter(e => e.category === cat.id).length
  })).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total)

  const averagePerDay = expenses.length > 0
    ? totalSpent / new Set(expenses.map(e => e.date)).size
    : 0

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading summary...</div>
  }

  return (
    <div className="space-y-6">
      {/* Trip Summary Header */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 Trip Complete!</h2>
          <p className="text-white/80 text-sm">Here's how you did</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSpent, currency)}
              </div>
            </div>
          </div>
          {totalBudget && (
            <div className="text-sm text-gray-600">
              Budget: {formatCurrency(totalBudget, currency)}
            </div>
          )}
        </div>

        <div className={cn(
          "bg-white rounded-2xl p-6 shadow-sm",
          isOverBudget ? "border-2 border-red-200" : "border-2 border-green-200"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isOverBudget ? "bg-red-100" : "bg-green-100"
            )}>
              {isOverBudget ? (
                <TrendingUp className="h-6 w-6 text-red-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {isOverBudget ? 'Over Budget' : 'Under Budget'}
              </div>
              <div className={cn(
                "text-2xl font-bold",
                isOverBudget ? "text-red-600" : "text-green-600"
              )}>
                {formatCurrency(Math.abs(budgetDifference), currency)}
              </div>
            </div>
          </div>
          {totalBudget && (
            <div className="text-sm text-gray-600">
              {isOverBudget
                ? `Spent ${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget`
                : `Saved ${(((totalBudget - totalSpent) / totalBudget) * 100).toFixed(1)}% of budget`
              }
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900">{expenses.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Expenses</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(averagePerDay, currency)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Avg. per Day</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900">{categoryTotals.length}</div>
          <div className="text-sm text-gray-500 mt-1">Categories Used</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-gray-700" />
          <h3 className="font-bold text-gray-900">Spending by Category</h3>
        </div>

        <div className="space-y-4">
          {categoryTotals.map((cat) => {
            const percentage = (cat.total / totalSpent) * 100
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-4 h-4 rounded-full', cat.color)} />
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                    <span className="text-xs text-gray-400">({cat.count} items)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(cat.total, currency)}
                    </div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', cat.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-gray-700" />
          <h3 className="font-bold text-gray-900">Top 5 Expenses</h3>
        </div>

        <div className="space-y-3">
          {[...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((expense, index) => {
              const category = categories.find(c => c.id === expense.category)
              return (
                <div key={expense.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                    #{index + 1}
                  </div>
                  <div className={cn('w-2 h-2 rounded-full', category?.color || 'bg-gray-500')} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{expense.title}</div>
                    <div className="text-xs text-gray-500">{category?.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount, currency)}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-gray-900 mb-3">💡 Trip Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Your biggest spending category was <strong>{categoryTotals[0]?.label}</strong> at {formatCurrency(categoryTotals[0]?.total || 0, currency)}</li>
          <li>• You spent an average of {formatCurrency(averagePerDay, currency)} per day</li>
          {isOverBudget ? (
            <li className="text-red-600">• Consider increasing your budget next time or reducing expenses in {categoryTotals[0]?.label}</li>
          ) : (
            <li className="text-green-600">• Great job staying under budget! You saved {formatCurrency(budgetDifference, currency)}</li>
          )}
        </ul>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No expenses recorded for this trip</p>
          <p className="text-sm mt-1">Add expenses in the Budget tab to see your summary</p>
        </div>
      )}
    </div>
  )
}
