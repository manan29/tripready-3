'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plane, ArrowLeft, User, Trash2, Shield, FileText, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setIsLoading(false)
    }
    loadUser()
  }, [])

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return

    setIsDeleting(true)

    try {
      // Delete all user data
      // 1. Delete checklist items
      await supabase.from('checklist_items').delete().eq('user_id', user.id)
      
      // 2. Delete expenses
      await supabase.from('expenses').delete().eq('user_id', user.id)
      
      // 3. Delete activities
      await supabase.from('activities').delete().eq('user_id', user.id)
      
      // 4. Delete flights
      await supabase.from('flights').delete().eq('user_id', user.id)
      
      // 5. Delete trips
      await supabase.from('trips').delete().eq('user_id', user.id)
      
      // 6. Delete profile
      await supabase.from('profiles').delete().eq('id', user.id)

      // 7. Sign out
      await supabase.auth.signOut()

      // Redirect to home
      router.push('/?deleted=true')
    } catch (error) {
      console.error('Error deleting account:', error)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/trips" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-2">
              <Plane className="h-7 w-7 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">Settings</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Profile
          </h2>
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || 'User'}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{profile?.display_name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Legal
          </h2>
          <div className="space-y-2">
            <Link
              href="/privacy"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">Privacy Policy</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">Terms of Service</span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-6 border-2 border-red-100">
          <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danger Zone
          </h2>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-sm text-red-700 mb-2">
                  <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted, including:
                </p>
                <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                  <li>All your trips</li>
                  <li>All checklists and items</li>
                  <li>All expenses and budget data</li>
                  <li>All activities and flights</li>
                  <li>Your profile information</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          TripReady v2.0 • Made for families who love to travel
        </p>
      </div>
    </div>
  )
}
