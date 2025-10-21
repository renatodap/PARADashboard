'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { Badge } from '@/components/ui/badge'

interface MonthViewProps {
  currentDate: Date
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onDayClick: (date: Date) => void
}

export function MonthView({ currentDate, tasks, onTaskClick, onDayClick }: MonthViewProps) {
  const monthDays = getMonthDays(currentDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function getMonthDays(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    // Next month days to fill grid
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }

  function getTasksForDay(date: Date) {
    return tasks.filter(task => {
      if (!task.due_date && !task.scheduled_start) return false
      const taskDate = task.scheduled_start ? new Date(task.scheduled_start) : new Date(task.due_date!)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b bg-white dark:bg-gray-950">
        {weekDays.map((day, i) => (
          <div key={i} className="border-r p-3 text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {monthDays.map((day, index) => {
          const dayTasks = getTasksForDay(day.date)

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.005 }}
              onClick={() => onDayClick(day.date)}
              className={cn(
                "border-r border-b p-2 hover:bg-para-project/5 transition-colors text-left relative min-h-[100px]",
                !day.isCurrentMonth && "bg-gray-50/50 dark:bg-gray-900/50 text-muted-foreground",
                isToday(day.date) && "bg-para-project/10 ring-2 ring-para-project ring-inset"
              )}
            >
              <div className={cn(
                "text-sm font-semibold mb-1",
                isToday(day.date) && "text-para-project"
              )}>
                {day.date.getDate()}
              </div>

              {/* Task Dots/Badges */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskClick(task)
                    }}
                    className={cn(
                      "block w-full text-left px-1.5 py-0.5 rounded text-xs truncate",
                      task.priority === 'urgent' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      task.priority === 'high' && "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
                      task.priority === 'medium' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                      task.priority === 'low' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                      task.status === 'completed' && "opacity-50 line-through"
                    )}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1.5">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
