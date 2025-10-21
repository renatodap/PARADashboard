'use client'

import { useEffect, useState } from 'react'
import { tasksAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Task } from '@/types'
import { CheckSquare, Search, Plus, Sparkles, Calendar, Clock, Flag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchQuery, priorityFilter, statusFilter])

  async function loadTasks() {
    try {
      const data = await tasksAPI.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterTasks() {
    let filtered = tasks

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
    }

    setFilteredTasks(filtered)
  }

  async function handleAutoSchedule() {
    setScheduling(true)
    try {
      // Call the auto-schedule endpoint
      await tasksAPI.autoSchedule()
      await loadTasks()
    } catch (error) {
      console.error('Auto-schedule failed:', error)
    } finally {
      setScheduling(false)
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      await tasksAPI.updateTask(task.id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        completed_at: task.status === 'completed' ? undefined : new Date().toISOString()
      })
      await loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <CheckSquare className="w-16 h-16 text-para-project mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-project/10 flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-para-project" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Tasks</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Manage your to-dos and let AI schedule them for you
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-2xl font-heading font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-2xl font-heading font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-2xl font-heading font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-2xl font-heading font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-2xl bg-white/50 dark:bg-white/5"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-2xl gap-2"
            onClick={handleAutoSchedule}
            disabled={scheduling}
          >
            <Sparkles className="w-4 h-4" />
            {scheduling ? 'Scheduling...' : 'Auto-Schedule'}
          </Button>
          <Button className="rounded-2xl gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex gap-2">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
              <Badge
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                className={`cursor-pointer rounded-full transition-all ${
                  statusFilter === status
                    ? 'bg-para-project text-white'
                    : 'hover:bg-para-project/10'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          <div className="flex gap-2">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((priority) => (
              <Badge
                key={priority}
                variant={priorityFilter === priority ? 'default' : 'outline'}
                className={`cursor-pointer rounded-full transition-all ${
                  priorityFilter === priority
                    ? 'bg-para-project text-white'
                    : 'hover:bg-para-project/10'
                }`}
                onClick={() => setPriorityFilter(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {searchQuery || priorityFilter !== 'all' || statusFilter !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks yet'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || priorityFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first task'}
            </p>
            {!searchQuery && priorityFilter === 'all' && statusFilter === 'all' && (
              <Button className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
                task.status === 'completed' && 'opacity-60'
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 w-6 h-6 rounded-lg border-2 border-para-project flex items-center justify-center hover:bg-para-project/10 transition-colors"
                  >
                    {task.status === 'completed' && (
                      <CheckSquare className="w-4 h-4 text-para-project" />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={cn(
                          "font-semibold text-lg",
                          task.status === 'completed' && 'line-through'
                        )}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Badge className={cn("rounded-full", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>

                    {/* Task Metadata */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(task.due_date)}
                        </div>
                      )}
                      {task.estimated_duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(task.estimated_duration_minutes)}
                        </div>
                      )}
                      {task.para_item_id && (
                        <div className="flex items-center gap-1">
                          <Flag className="w-4 h-4" />
                          Linked to project
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
