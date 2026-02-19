'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExplorePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#64748B]">Redirecting...</p>
    </div>
  )
}
