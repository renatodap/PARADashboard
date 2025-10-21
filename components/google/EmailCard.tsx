'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight, Clock } from 'lucide-react'

interface EmailCardProps {
  email: {
    id: string
    subject: string
    from: string
    to: string
    date: string
    snippet: string
    is_unread: boolean
    is_important: boolean
  }
  onConvertToTask: () => void
}

export function EmailCard({ email, onConvertToTask }: EmailCardProps) {
  const getTimeAgo = (dateStr: string) => {
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
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group"
    >
      <div className={`
        p-4 rounded-2xl border-2 transition-all duration-300
        ${email.is_unread
          ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
          : 'bg-white/50 dark:bg-white/5 border-border hover:border-para-project/30'
        }
      `}>
        <div className="flex items-start gap-4">
          {/* Email Icon */}
          <motion.div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${email.is_important
                ? 'bg-gradient-to-br from-red-500 to-rose-500'
                : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }
            `}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Mail className="w-5 h-5 text-white" />
          </motion.div>

          {/* Email Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`
                font-semibold text-sm line-clamp-1
                ${email.is_unread ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {email.subject || '(No Subject)'}
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="w-3 h-3" />
                {getTimeAgo(email.date)}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
              From: <span className="font-medium">{email.from}</span>
            </p>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {email.snippet}
            </p>

            {/* Convert to Task Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onConvertToTask}
                size="sm"
                className="gap-2 rounded-xl bg-gradient-to-r from-para-project to-para-area hover:from-para-area hover:to-para-resource transition-all"
              >
                Convert to Task
                <ArrowRight className="w-3 h-3" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Important Badge */}
        {email.is_important && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
