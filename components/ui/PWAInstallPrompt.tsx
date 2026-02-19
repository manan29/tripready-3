'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstalled(true)
    }

    // Clear the deferred prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="bg-white/20 rounded-xl p-2 flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install JourneyAI</h3>
            <p className="text-sm text-white/90 mb-3">
              Add to your home screen for quick access and offline support!
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-purple-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/20 text-white px-3 py-2 rounded-xl text-sm hover:bg-white/30 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
