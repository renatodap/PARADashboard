'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { Calendar, Clock } from 'lucide-react'

interface WeekViewProps {
  currentDate: Date
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onSlotClick: (date: Date, hour: number) => void
}

export function WeekView({ currentDate, tasks, onTaskClick, onSlotClick }: WeekViewProps) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6am to 10pm
  const weekDays = getWeekDays(currentDate)

  function getWeekDays(date: Date) {
    const days = []
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay()) // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  function getTasksForDay(day: Date) {
    return tasks.filter(task => {
      if (!task.scheduled_start) return false
      const taskDate = new Date(task.scheduled_start)
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      )
    })
  }

  function getTaskPosition(task: Task) {
    if (!task.scheduled_start) return null
    const start = new Date(task.scheduled_start)
    const hour = start.getHours()
    const minutes = start.getMinutes()
    const top = ((hour - 6) * 60 + minutes) * (60 / 60) // 60px per hour
    const duration = task.estimated_duration_minutes || 30
    const height = (duration / 60) * 60
    return { top, height }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 border-red-600'
      case 'high':
        return 'bg-orange-500 border-orange-600'
      case 'medium':
        return 'bg-yellow-500 border-yellow-600'
      case 'low':
        return 'bg-blue-500 border-blue-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hour = now.getHours()
    const minutes = now.getMinutes()
    if (hour < 6 || hour >= 23) return null
    return ((hour - 6) * 60 + minutes) * (60 / 60)
  }

  const currentTimeTop = getCurrentTimePosition()

  return (
    <div className="flex flex-col h-full">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-white dark:bg-gray-950 z-10">
        <div className="border-r p-2" /> {/* Time column header */}
        {weekDays.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "border-r p-3 text-center",
              isToday(day) && "bg-para-project/10"
            )}
          >
            <div className="text-xs text-muted-foreground uppercase">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={cn(
              "text-2xl font-bold mt-1",
              isToday(day) && "text-para-project"
            )}>
              {day.getDate()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 relative">
          {/* Time Column */}
          <div className="border-r">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-b px-2 py-1 text-xs text-muted-foreground text-right">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r relative">
              {/* Hour Slots */}
              {hours.map((hour) => (
                <button
                  key={hour}
                  onClick={() => onSlotClick(day, hour)}
                  className="w-full h-[60px] border-b hover:bg-para-project/5 transition-colors text-left p-1"
                />
              ))}

              {/* Tasks */}
              {getTasksForDay(day).map((task) => {
                const position = getTaskPosition(task)
                if (!position) return null

                return (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, zIndex: 10 }}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "absolute left-1 right-1 rounded-lg border-l-4 p-2 text-left overflow-hidden",
                      "text-white shadow-md hover:shadow-lg transition-all",
                      getPriorityColor(task.priority),
                      task.status === 'completed' && 'opacity-50'
                    )}
                    style={{
                      top: `${position.top}px`,
                      height: `${Math.max(position.height, 30)}px`
                    }}
                  >
                    <div className="text-sm font-semibold truncate">{task.title}</div>
                    {position.height > 40 && (
                      <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_duration_minutes} min
                      </div>
                    )}
                  </motion.button>
                )
              })}

              {/* Current Time Indicator */}
              {isToday(day) && currentTimeTop !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute left-0 right-0 flex items-center z-20 pointer-events-none"
                  style={{ top: `${currentTimeTop}px` }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
                  <div className="flex-1 h-0.5 bg-red-500" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
