'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Archive, Trash2, Edit, X } from 'lucide-react'
import { paraAPI, tasksAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { pushNotification } from '@/components/notifications/NotificationCenter'
import type { PARAItem, Task } from '@/types'

interface RolloverAlert {
  id: string
  type: 'stale_project' | 'overdue_task' | 'rollover_task'
  title: string
  description: string
  daysStale: number
  item?: PARAItem
  task?: Task
  severity: 'high' | 'medium' | 'low'
}

export function RolloverAlerts() {
  const [alerts, setAlerts] = useState<RolloverAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    try {
      setLoading(true)

      // Fetch all projects and tasks
      const [projects, tasks] = await Promise.all([
        paraAPI.getItems('project'),
        tasksAPI.getTasks()
      ])

      const now = new Date()
      const alertsList: RolloverAlert[] = []

      // Check for stale projects (no update in 14+ days)
      projects
        .filter(p => p.status === 'active')
        .forEach(project => {
          const updatedAt = new Date(project.updated_at)
          const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

          if (daysSinceUpdate >= 14) {
            alertsList.push({
              id: `project-${project.id}`,
              type: 'stale_project',
              title: project.title,
              description: `No activity for ${daysSinceUpdate} days. Archive or update?`,
              daysStale: daysSinceUpdate,
              item: project,
              severity: daysSinceUpdate >= 30 ? 'high' : daysSinceUpdate >= 21 ? 'medium' : 'low'
            })
          }
        })

      // Check for overdue tasks
      tasks
        .filter((t: Task) => t.status !== 'completed' && t.due_date)
        .forEach((task: Task) => {
          const dueDate = new Date(task.due_date!)
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysOverdue > 0) {
            alertsList.push({
              id: `overdue-${task.id}`,
              type: 'overdue_task',
              title: task.title,
              description: `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
              daysStale: daysOverdue,
              task,
              severity: daysOverdue >= 7 ? 'high' : daysOverdue >= 3 ? 'medium' : 'low'
            })
          }
        })

      // Check for rollover tasks (due date changed 3+ times)
      // Note: This would require tracking task history - for now, we'll identify tasks with no progress
      tasks
        .filter((t: Task) => t.status === 'in_progress')
        .forEach((task: Task) => {
          const createdAt = new Date(task.created_at)
          const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

          // If task has been "in progress" for 7+ days, it's likely being rolled over
          if (daysSinceCreation >= 7) {
            alertsList.push({
              id: `rollover-${task.id}`,
              type: 'rollover_task',
              title: task.title,
              description: `In progress for ${daysSinceCreation} days. Break it down?`,
              daysStale: daysSinceCreation,
              task,
              severity: daysSinceCreation >= 14 ? 'high' : 'medium'
            })
          }
        })

      // Sort by severity and days stale
      alertsList.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity]
        }
        return b.daysStale - a.daysStale
      })

      setAlerts(alertsList)

      // Proactively push notifications for high-severity alerts
      const highSeverityAlerts = alertsList.filter(a => a.severity === 'high')
      if (highSeverityAlerts.length > 0) {
        // Only notify about the top high-severity alert to avoid spam
        const topAlert = highSeverityAlerts[0]

        pushNotification({
          type: 'warning',
          title: `Attention needed: ${topAlert.title}`,
          message: topAlert.description,
          actionLabel: 'View Details',
          actionHref: topAlert.type === 'stale_project'
            ? `/dashboard/projects/${topAlert.item?.id}`
            : '/dashboard/tasks'
        })
      }
    } catch (error) {
      console.error('Failed to load rollover alerts:', error)
      showToast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  async function handleArchiveProject(projectId: string) {
    try {
      await paraAPI.updateItem(projectId, { status: 'archived' })
      showToast.success('Project archived!')
      loadAlerts()
    } catch (error) {
      showToast.error('Failed to archive project')
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await tasksAPI.deleteTask(taskId)
      showToast.success('Task deleted!')
      loadAlerts()
    } catch (error) {
      showToast.error('Failed to delete task')
    }
  }

  function handleDismiss(alertId: string) {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))

  if (loading) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Loading Alerts...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-900/30 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/10">
        <CardContent className="pt-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium text-green-800 dark:text-green-300">All caught up!</p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">No stale projects or overdue tasks</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-tour="rollover-alerts" className="border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </motion.div>
            Needs Attention
          </CardTitle>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            {visibleAlerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {visibleAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <div className={`p-3 rounded-xl border ${
                alert.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                  : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDismiss(alert.id)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {alert.type === 'stale_project' && alert.item && (
                    <>
                      <Button
                        onClick={() => handleArchiveProject(alert.item!.id)}
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Archive className="w-3 h-3 mr-1" />
                        Archive
                      </Button>
                      <Button
                        onClick={() => window.location.href = `/dashboard/projects/${alert.item!.id}`}
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                    </>
                  )}

                  {(alert.type === 'overdue_task' || alert.type === 'rollover_task') && alert.task && (
                    <>
                      <Button
                        onClick={() => handleDeleteTask(alert.task!.id)}
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                      <Button
                        onClick={() => window.location.href = `/dashboard/tasks`}
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Reschedule
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
