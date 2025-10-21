'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock, List, LayoutGrid, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { tasksAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import type { Task } from '@/types'
import { WeekView } from '@/components/calendar/WeekView'
import { MonthView } from '@/components/calendar/MonthView'
import { TaskModal } from '@/components/tasks/TaskModal'

type ViewMode = 'week' | 'month'

const viewModes = [
  { id: 'week' as ViewMode, label: 'Week', icon: LayoutGrid },
  { id: 'month' as ViewMode, label: 'Month', icon: Calendar }
]

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null)
  const [newTaskHour, setNewTaskHour] = useState<number | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await tasksAPI.getTasks()
      setTasks(data)
    } catch (error) {
      showToast.error('Failed to load tasks')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrentPeriod = () => {
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' })
    const year = currentDate.getFullYear()

    if (viewMode === 'week') {
      return `${month} ${year}`
    } else {
      return `${month} ${year}`
    }
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  const handleTaskClick = (task: Task) => {
    setModalMode('edit')
    setSelectedTask(task)
    setNewTaskDate(null)
    setNewTaskHour(null)
    setModalOpen(true)
  }

  const handleSlotClick = (date: Date, hour?: number) => {
    setModalMode('create')
    setSelectedTask(null)
    setNewTaskDate(date)
    setNewTaskHour(hour ?? null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedTask(null)
    setNewTaskDate(null)
    setNewTaskHour(null)
  }

  const handleModalSave = () => {
    loadTasks()
  }

  const handleAutoSchedule = async () => {
    try {
      await tasksAPI.autoSchedule()
      showToast.success('Tasks scheduled successfully')
      loadTasks()
    } catch (error) {
      showToast.error('Failed to auto-schedule tasks')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Calendar className="w-12 h-12 text-para-area" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
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
            <p className="text-sm text-muted-foreground">Visualize and schedule your tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl gap-2"
            onClick={handleAutoSchedule}
          >
            <Sparkles className="w-4 h-4" />
            Auto-Schedule
          </Button>
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
        className="flex gap-2 mb-4"
      >
        {viewModes.map((mode) => {
          const Icon = mode.icon
          const isSelected = viewMode === mode.id

          return (
            <motion.button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300',
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
        className="flex-1 overflow-hidden"
      >
        <Card className="glass h-full flex flex-col">
          {viewMode === 'week' && (
            <WeekView
              currentDate={currentDate}
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onDayClick={handleSlotClick}
            />
          )}
        </Card>
      </motion.div>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  )
}
