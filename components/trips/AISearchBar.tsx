'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { TripPreview } from './TripPreview'

interface ParsedTrip {
  destination: string
  start_date: string
  end_date: string
  adults: number
  kids: number
  kid_ages: number[]
  budget: number | null
  currency: string
}

export function AISearchBar() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedTrip, setParsedTrip] = useState<ParsedTrip | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (data.error) {
        if (data.error === 'destination_required') {
          setError('Please include a destination in your trip description.')
        } else {
          setError(data.error)
        }
        return
      }

      setParsedTrip(data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setParsedTrip(null)
    setInput('')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary-500" />
            )}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Plan a trip with AI..."
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-lg transition-all disabled:opacity-50"
          />
          {input && !isLoading && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Try: "Thailand with 2 kids in March" or "7 day Singapore trip, budget 1.5 lakhs"
        </p>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </form>

      {/* Trip Preview Modal */}
      {parsedTrip && (
        <TripPreview trip={parsedTrip} onClose={handleClose} />
      )}
    </>
  )
}
