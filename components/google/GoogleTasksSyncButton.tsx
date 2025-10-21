'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { googleAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { RefreshCw, Loader2 } from 'lucide-react'

interface GoogleTasksSyncButtonProps {
  onSyncComplete?: (result: any) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function GoogleTasksSyncButton({
  onSyncComplete,
  variant = 'default',
  size = 'default',
  className = ''
}: GoogleTasksSyncButtonProps) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await googleAPI.syncTasks(undefined, true, true)

      showToast.success(
        `Synced! ${result.synced_to_google} tasks → Google, ${result.synced_from_google} tasks ← Google`
      )

      onSyncComplete?.(result)
    } catch (error: any) {
      console.error('Failed to sync tasks:', error)
      showToast.error(error.message || 'Failed to sync tasks')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant={variant}
        size={size}
        className={`gap-2 rounded-2xl ${className}`}
      >
        <motion.div
          animate={{ rotate: syncing ? 360 : 0 }}
          transition={{
            duration: 1,
            repeat: syncing ? Infinity : 0,
            ease: "linear"
          }}
        >
          {syncing ? (
            <Loader2 className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </motion.div>
        {size !== 'icon' && (syncing ? 'Syncing...' : 'Sync Google Tasks')}
      </Button>
    </motion.div>
  )
}
