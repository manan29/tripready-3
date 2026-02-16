'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  redirectUrl?: string
}

export default function SignupModal({ isOpen, onClose, redirectUrl }: SignupModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleSignup = () => {
    const loginUrl = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'
    router.push(loginUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">Save your trip</h2>
          <p className="text-gray-600 mb-8">
            Create an account to save and access your trip anytime
          </p>

          {/* Sign Up Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleSignup}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-purple-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleSignup}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Login Link */}
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={handleSignup}
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
