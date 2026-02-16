'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { GlassCard } from './GlassCard'

interface AISearchBarProps {
  onSubmit: (query: string) => void
  placeholder?: string
  isLoading?: boolean
}

export function AISearchBar({
  onSubmit,
  placeholder = 'Plan a trip with AI...',
  isLoading = false,
}: AISearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim())
    }
  }

  return (
    <div>
      <GlassCard padding="none" className="flex items-center gap-3 px-4 py-3">
        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base"
        />
        {query && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? '...' : 'Go'}
          </button>
        )}
      </GlassCard>
      <p className="text-center text-gray-400 text-xs mt-3">
        Try: "Dubai with toddler" or "Singapore with 2 kids (3 and 6 years old)"
      </p>
    </div>
  )
}
