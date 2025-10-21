'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { integrationsAPI } from '@/lib/api'
import { GoogleOAuthButton } from '@/components/google/GoogleOAuthButton'
import { GoogleIntegrationCard } from '@/components/google/GoogleIntegrationCard'
import { SkeletonCard } from '@/components/loading/SkeletonCard'
import { Settings as SettingsIcon, Sparkles } from 'lucide-react'

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrations()
  }, [])

  async function loadIntegrations() {
    try {
      const data = await integrationsAPI.getIntegrations()
      setIntegrations(data)
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const googleIntegration = integrations.find(i => i.integration_type === 'google_calendar')
  const isGoogleConnected = googleIntegration?.is_enabled

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <SettingsIcon className="w-8 h-8 text-para-project" />
          </motion.div>
          <h1 className="text-4xl font-heading font-bold text-gradient">
            Settings
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Manage your integrations and preferences
        </p>
      </motion.div>

      {/* Integrations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-archive to-para-project flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-heading font-semibold">Integrations</h2>
            <p className="text-sm text-muted-foreground">Connect external services to enhance your workflow</p>
          </div>
        </div>

        {loading ? (
          <SkeletonCard variant="stat" className="h-96" />
        ) : isGoogleConnected ? (
          <GoogleIntegrationCard
            integration={googleIntegration}
            onDisconnect={loadIntegrations}
          />
        ) : (
          <motion.div
            className="glass p-12 rounded-2xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-para-archive to-para-project flex items-center justify-center"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </motion.div>

            <h3 className="text-2xl font-heading font-semibold mb-2">Connect Google Account</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Unlock powerful features like Gmail integration, Calendar sync, and Google Tasks bidirectional sync with one click
            </p>

            <div className="flex flex-col items-center gap-4">
              <GoogleOAuthButton onSuccess={loadIntegrations} size="lg" />

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Gmail
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Calendar
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  Tasks
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
