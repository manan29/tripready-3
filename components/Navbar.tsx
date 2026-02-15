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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-gray-900">Journey</span>
              <span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {loading ? (
              // Loading state
              <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              // Logged in: Show "My Trips" button
              <Link
                href="/trips"
                className="bg-primary hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
              >
                My Trips
              </Link>
            ) : (
              // Not logged in: Show "Login" and "Sign Up"
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="bg-primary hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
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
