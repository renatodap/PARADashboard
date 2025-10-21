'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ViewMode = 'day' | 'week' | 'month' | 'timeline'

const viewModes = [
  { id: 'day' as ViewMode, label: 'Day', icon: Clock },
  { id: 'week' as ViewMode, label: 'Week', icon: LayoutGrid },
  { id: 'month' as ViewMode, label: 'Month', icon: Calendar },
  { id: 'timeline' as ViewMode, label: 'Timeline', icon: List }
]

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const formatCurrentPeriod = () => {
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' })
    const year = currentDate.getFullYear()

    if (viewMode === 'day') {
      const day = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      return day
    } else if (viewMode === 'week') {
      return `${month} ${year}`
    } else {
      return `${month} ${year}`
    }
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Calendar className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Calendar</h1>
            <p className="text-sm text-muted-foreground">Plan your time with AI assistance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => navigatePeriod('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-[200px] text-center font-semibold">
            {formatCurrentPeriod()}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => navigatePeriod('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* View Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {viewModes.map((mode) => {
          const Icon = mode.icon
          const isSelected = viewMode === mode.id

          return (
            <motion.button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300 whitespace-nowrap',
                isSelected
                  ? 'border-para-area bg-gradient-to-br from-para-area to-para-resource text-white shadow-lg'
                  : 'border-border bg-white/50 dark:bg-white/5 hover:border-para-area/50'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{mode.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Calendar Content */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass p-6">
          <div className="text-center py-20">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center"
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
              <Calendar className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
            </h3>
            <p className="text-muted-foreground mb-6">
              Calendar {viewMode} view coming soon! This will show your scheduled tasks and events.
            </p>
            <Button className="rounded-2xl">
              Set up your first schedule
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* AI Scheduling Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass border-l-4 border-para-area p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">AI-Powered Scheduling</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Let AI automatically schedule your tasks based on priorities, deadlines, and your energy patterns.
                The system learns your preferences and optimizes your calendar for maximum productivity.
              </p>
              <Button className="rounded-2xl gap-2">
                <Clock className="w-4 h-4" />
                Enable Auto-Schedule
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
