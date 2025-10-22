'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionLabel?: string
  actionHref?: string
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Listen for notification events
  useEffect(() => {
    const handleNotification = (event: CustomEvent<Notification>) => {
      setNotifications(prev => [event.detail, ...prev].slice(0, 10)) // Keep last 10
    }

    window.addEventListener('push-notification', handleNotification as EventListener)
    return () => window.removeEventListener('push-notification', handleNotification as EventListener)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
      case 'success': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
      case 'error': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
      default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          notification.read
                            ? 'bg-white/50 dark:bg-white/5 border-border'
                            : getBgColor(notification.type)
                        }`}
                        onClick={() => {
                          if (!notification.read) handleMarkRead(notification.id)
                          if (notification.actionHref) {
                            window.location.href = notification.actionHref
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`text-sm font-semibold ${
                                notification.read ? 'text-muted-foreground' : 'text-foreground'
                              }`}>
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDismiss(notification.id)
                                }}
                                className="h-5 w-5 p-0 hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>

                            <p className={`text-xs mb-2 ${
                              notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground/60">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </span>

                              {notification.actionLabel && (
                                <span className="text-xs font-medium text-para-project">
                                  {notification.actionLabel} →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to trigger notifications from anywhere
export function pushNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const event = new CustomEvent('push-notification', {
    detail: {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false
    }
  })
  window.dispatchEvent(event)
}
