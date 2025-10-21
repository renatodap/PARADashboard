'use client'

import { useEffect, useState } from 'react'
import { tasksAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types'
import { Calendar as CalendarIcon, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const data = await tasksAPI.getTasks()
      // Filter tasks with due dates
      const scheduledTasks = data.filter(t => t.due_date)
      setTasks(scheduledTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAutoSchedule() {
    setScheduling(true)
    try {
      await tasksAPI.autoSchedule()
      await loadTasks()
    } catch (error) {
      console.error('Auto-schedule failed:', error)
    } finally {
      setScheduling(false)
    }
  }

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.due_date) return acc
    const date = new Date(task.due_date).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Get next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <CalendarIcon className="w-16 h-16 text-para-project mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-area/10 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-para-area" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Calendar</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Your AI-powered schedule for the week ahead
        </p>
      </div>

      {/* Auto-Schedule CTA */}
      <Card className="glass border-l-4 border-para-project">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">AI Auto-Schedule</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Let AI organize your tasks across the week based on priority and estimated time
                </p>
              </div>
            </div>
            <Button
              onClick={handleAutoSchedule}
              disabled={scheduling}
              className="rounded-2xl"
            >
              {scheduling ? 'Scheduling...' : 'Run Auto-Schedule'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly View */}
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-6">Next 7 Days</h2>
        <div className="space-y-4">
          {next7Days.map((date) => {
            const dateStr = date.toDateString()
            const dayTasks = tasksByDate[dateStr] || []
            const isToday = dateStr === new Date().toDateString()
            const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.estimated_duration_minutes || 0), 0)

            return (
              <Card
                key={dateStr}
                className={cn(
                  "glass transition-all duration-300",
                  isToday && "border-l-4 border-para-project shadow-project"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {isToday && (
                          <div className="w-2 h-2 rounded-full bg-para-project animate-pulse" />
                        )}
                        <span className={isToday ? 'text-para-project' : ''}>
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        {isToday && (
                          <span className="text-sm font-normal text-para-project">Today</span>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(totalMinutes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {dayTasks.filter(t => t.status === 'completed').length}/{dayTasks.length} tasks
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dayTasks.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors",
                            task.status === 'completed' && 'opacity-60'
                          )}
                        >
                          <div className={cn(
                            "w-1 h-12 rounded-full",
                            task.priority === 'urgent' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          )} />
                          <div className="flex-1">
                            <div className={cn(
                              "font-medium",
                              task.status === 'completed' && 'line-through'
                            )}>
                              {task.title}
                            </div>
                            {task.estimated_duration_minutes && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDuration(task.estimated_duration_minutes)}
                              </div>
                            )}
                          </div>
                          {task.status === 'completed' && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
