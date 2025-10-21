'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { googleAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { CheckCircle2, XCircle, Mail, Calendar, CheckSquare, Loader2, AlertCircle } from 'lucide-react'

interface GoogleIntegrationCardProps {
  integration: any
  onDisconnect?: () => void
}

export function GoogleIntegrationCard({ integration, onDisconnect }: GoogleIntegrationCardProps) {
  const [disconnecting, setDisconnecting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await googleAPI.revokeAccess()
      showToast.success('Google account disconnected')
      onDisconnect?.()
    } catch (error) {
      console.error('Failed to disconnect:', error)
      showToast.error('Failed to disconnect Google account')
    } finally {
      setDisconnecting(false)
      setShowConfirm(false)
    }
  }

  const getTimeSinceSync = (lastSync: string) => {
    if (!lastSync) return 'Never'
    const now = new Date()
    const syncDate = new Date(lastSync)
    const diffMs = now.getTime() - syncDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const isConnected = integration?.is_enabled

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="glass overflow-hidden relative group">
        {/* Gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-para-archive to-para-project opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        />

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-archive to-para-project flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </motion.div>
              <div>
                <CardTitle className="text-xl font-heading">Google Integration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isConnected ? integration.config?.google_user_email || 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                className={`rounded-full ${
                  isConnected
                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                    : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                }`}
              >
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          {isConnected ? (
            <>
              {/* Services */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gmail</p>
                    <p className="text-xs text-muted-foreground">Email management & task extraction</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Calendar</p>
                    <p className="text-xs text-muted-foreground">Event sync & scheduling</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-500/5 border border-teal-500/20">
                  <CheckSquare className="w-5 h-5 text-teal-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Google Tasks</p>
                    <p className="text-xs text-muted-foreground">Bidirectional task sync</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>

              {/* Sync Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Last synced: {getTimeSinceSync(integration.last_sync_at)}</span>
                <span>Auto-sync: Every 5 min</span>
              </div>

              {/* Disconnect Button */}
              {!showConfirm ? (
                <Button
                  onClick={() => setShowConfirm(true)}
                  variant="outline"
                  className="w-full rounded-2xl border-red-500/30 text-red-600 hover:bg-red-500/10"
                >
                  Disconnect Google Account
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">Are you sure? This will stop all Google syncs.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      variant="destructive"
                      className="flex-1 rounded-2xl"
                    >
                      {disconnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        'Yes, Disconnect'
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowConfirm(false)}
                      variant="outline"
                      className="flex-1 rounded-2xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Google account to unlock Gmail, Calendar, and Tasks integration
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
