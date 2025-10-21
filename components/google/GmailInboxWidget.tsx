'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmailCard } from './EmailCard'
import { googleAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Mail, RefreshCw, Sparkles, Inbox } from 'lucide-react'

interface GmailInboxWidgetProps {
  onEmailConvert?: (emailId: string) => void
  maxEmails?: number
}

export function GmailInboxWidget({ onEmailConvert, maxEmails = 5 }: GmailInboxWidgetProps) {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      setError(null)
      const { emails: fetchedEmails, count } = await googleAPI.getUnreadEmails(maxEmails)
      setEmails(fetchedEmails)
    } catch (err: any) {
      console.error('Failed to fetch emails:', err)
      setError(err.message || 'Failed to load emails')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchEmails()
  }

  const handleConvertEmail = (email: any) => {
    onEmailConvert?.(email)
  }

  return (
    <Card className="glass" data-gmail-widget>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Mail className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-heading font-semibold">Gmail Inbox</h3>
                {!loading && emails.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Badge className="rounded-full bg-blue-500/10 text-blue-600 border-blue-500/20">
                      {emails.length} unread
                    </Badge>
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Convert emails to tasks with AI</p>
            </div>
          </div>

          {/* Refresh Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="ghost"
              size="icon"
              className="rounded-xl"
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{
                  duration: 1,
                  repeat: refreshing ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Failed to load emails</h4>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="rounded-2xl">
              Try Again
            </Button>
          </motion.div>
        ) : emails.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
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
              <Inbox className="w-8 h-8 text-white" />
            </motion.div>
            <h4 className="text-lg font-semibold mb-2">Inbox Zero!</h4>
            <p className="text-sm text-muted-foreground">No unread emails. You're all caught up!</p>
          </motion.div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {emails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onConvertToTask={() => handleConvertEmail(email)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
