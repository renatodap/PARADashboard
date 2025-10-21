'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Root page - redirects to beta landing page
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/beta')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-slate-600">Redirecting...</div>
    </div>
  )
}
