'use client'

import { motion } from 'framer-motion'
import { Clock, FileText, CheckSquare, Folder, Archive, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'capture' | 'complete' | 'create' | 'archive'
  title: string
  category: 'project' | 'area' | 'resource' | 'archive'
  timestamp: Date
  icon?: any
}

interface ActivityTimelineProps {
  activities: Activity[]
  maxItems?: number
}

const typeConfig = {
  capture: {
    icon: Sparkles,
    label: 'Captured',
    color: 'text-para-project'
  },
  complete: {
    icon: CheckSquare,
    label: 'Completed',
    color: 'text-para-resource'
  },
  create: {
    icon: Folder,
    label: 'Created',
    color: 'text-para-area'
  },
  archive: {
    icon: Archive,
    label: 'Archived',
    color: 'text-para-archive'
  }
}

const categoryColors = {
  project: 'from-para-project/20 to-para-project/10 border-para-project/30',
  area: 'from-para-area/20 to-para-area/10 border-para-area/30',
  resource: 'from-para-resource/20 to-para-resource/10 border-para-resource/30',
  archive: 'from-para-archive/20 to-para-archive/10 border-para-archive/30'
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Clock className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-heading font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest updates</p>
          </div>
        </div>

        {displayActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project/20 to-para-area/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start capturing to see your timeline</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {displayActivities.map((activity, index) => {
              const config = typeConfig[activity.type]
              const Icon = config.icon
              const isLast = index === displayActivities.length - 1

              return (
                <motion.div
                  key={activity.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="relative"
                >
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
                  )}

                  <div className="flex items-start gap-4 group">
                    {/* Icon */}
                    <motion.div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br border-2 flex-shrink-0 relative z-10',
                        categoryColors[activity.category]
                      )}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {config.label}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
