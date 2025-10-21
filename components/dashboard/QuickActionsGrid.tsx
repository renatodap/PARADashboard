'use client'

import { motion } from 'framer-motion'
import {
  Zap,
  Brain,
  Calendar,
  TrendingUp,
  FileText,
  Target,
  Clock,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: any
  gradient: string
  action: () => void
}

export function QuickActionsGrid() {
  const quickActions: QuickAction[] = [
    {
      id: 'auto-schedule',
      label: 'Auto-Schedule',
      description: 'Fill your day with AI',
      icon: Zap,
      gradient: 'from-para-project to-para-area',
      action: () => console.log('Auto-schedule')
    },
    {
      id: 'weekly-review',
      label: 'Weekly Review',
      description: 'Reflect on progress',
      icon: Brain,
      gradient: 'from-para-area to-para-resource',
      action: () => console.log('Weekly review')
    },
    {
      id: 'view-calendar',
      label: 'Calendar',
      description: 'Plan your week',
      icon: Calendar,
      gradient: 'from-para-resource to-para-archive',
      action: () => console.log('View calendar')
    },
    {
      id: 'insights',
      label: 'Insights',
      description: 'View analytics',
      icon: TrendingUp,
      gradient: 'from-para-archive to-para-project',
      action: () => console.log('Insights')
    }
  ]

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-resource to-para-archive flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-heading font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Common tasks at your fingertips</p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {quickActions.map((action) => {
            const Icon = action.icon

            return (
              <motion.button
                key={action.id}
                onClick={action.action}
                className={cn(
                  'relative overflow-hidden rounded-2xl p-6 text-left',
                  'border-2 border-border hover:border-transparent',
                  'bg-white/50 dark:bg-white/5',
                  'transition-all duration-300',
                  'group'
                )}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    action.gradient
                  )}
                  initial={{ opacity: 0 }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    className={cn(
                      'w-12 h-12 rounded-2xl mb-4 flex items-center justify-center',
                      'bg-gradient-to-br',
                      action.gradient,
                      'group-hover:bg-white/20'
                    )}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <h4 className={cn(
                    'font-semibold mb-1 transition-colors',
                    'group-hover:text-white'
                  )}>
                    {action.label}
                  </h4>
                  <p className={cn(
                    'text-sm text-muted-foreground transition-colors',
                    'group-hover:text-white/80'
                  )}>
                    {action.description}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </CardContent>
    </Card>
  )
}
