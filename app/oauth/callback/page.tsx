'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SuccessConfetti } from '@/components/animations/SuccessConfetti'
import { showToast } from '@/lib/toast'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'google_calendar_connected') {
      setStatus('success')
      setShowConfetti(true)
      showToast.success('Google account connected successfully!')

      // Redirect to settings after animation
      setTimeout(() => {
        router.push('/dashboard/settings')
      }, 2500)
    } else if (error) {
      setStatus('error')
      showToast.error(`Connection failed: ${error}`)

      // Redirect to settings after showing error
      setTimeout(() => {
        router.push('/dashboard/settings')
      }, 3000)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center"
      >
        {status === 'loading' && (
          <div className="space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-16 h-16 mx-auto text-para-project" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-2">Processing...</h2>
              <p className="text-muted-foreground">Connecting your Google account</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-heading font-bold text-gradient mb-2"
              >
                Success!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                Your Google account has been connected
              </motion.p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-heading font-bold mb-2"
              >
                Connection Failed
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                {searchParams.get('error') || 'An error occurred'}
              </motion.p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Success Confetti */}
      <SuccessConfetti show={showConfetti} />
    </div>
  )
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-center"
        >
          <div className="space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-16 h-16 mx-auto text-para-project" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-2">Processing...</h2>
              <p className="text-muted-foreground">Connecting your Google account</p>
            </div>
          </div>
        </motion.div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
