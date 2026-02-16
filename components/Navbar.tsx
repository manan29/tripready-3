'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Globe className="h-6 w-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
            <span className="text-2xl font-bold">
              <span className="text-gray-900">Journey</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {loading ? (
              // Loading state
              <div className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse" />
            ) : user ? (
              // Logged in: Show "My Trips" button
              <Link
                href="/trips"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:-translate-y-0.5 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200"
              >
                My Trips
              </Link>
            ) : (
              // Not logged in: Show "Login" and "Sign Up"
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:-translate-y-0.5 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
