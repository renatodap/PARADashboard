'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, RefreshCw, XCircle, Clock } from 'lucide-react'

interface SyncStatusIndicatorProps {
  status: 'synced' | 'syncing' | 'error' | 'never'
  lastSyncAt?: string
  className?: string
}

export function SyncStatusIndicator({ status, lastSyncAt, className = '' }: SyncStatusIndicatorProps) {
  const getTimeSince = (dateStr: string) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle2,
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          label: `Synced ${getTimeSince(lastSyncAt || '')}`,
          animate: false
        }
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          label: 'Syncing...',
          animate: true
        }
      case 'error':
        return {
          icon: XCircle,
          color: 'bg-red-500/10 text-red-600 border-red-500/20',
          label: 'Sync failed',
          animate: false
        }
      case 'never':
        return {
          icon: Clock,
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          label: 'Not synced',
          animate: false
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Badge className={`rounded-full gap-2 ${config.color}`}>
        <motion.div
          animate={config.animate ? { rotate: 360 } : {}}
          transition={{
            duration: 1.5,
            repeat: config.animate ? Infinity : 0,
            ease: "linear"
          }}
        >
          <Icon className="w-3 h-3" />
        </motion.div>
        <span className="text-xs">{config.label}</span>
      </Badge>
    </motion.div>
  )
}
