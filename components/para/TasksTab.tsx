'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react'
import type { PARATask } from '@/types'

interface TasksTabProps {
  itemId: string
  tasks: PARATask[]
  onTasksChange: () => void
}

const priorityColors = {
  low: 'text-blue-600 bg-blue-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-red-600 bg-red-50'
}

export function TasksTab({ itemId, tasks, onTasksChange }: TasksTabProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      showToast.error('Task title is required')
      return
    }

    try {
      await paraAPI.createTask(itemId, {
        title: newTaskTitle,
        priority: 'medium'
      })
      setNewTaskTitle('')
      setIsAdding(false)
      onTasksChange()
      showToast.success('Task added!')
    } catch (error) {
      showToast.error('Failed to add task')
    }
  }

  const handleToggleComplete = async (task: PARATask) => {
    try {
      await paraAPI.updateTask(itemId, task.id, {
        completed: !task.completed
      })
      onTasksChange()
    } catch (error) {
      showToast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await paraAPI.deleteTask(itemId, taskId)
      onTasksChange()
      showToast.success('Task deleted')
    } catch (error) {
      showToast.error('Failed to delete task')
    }
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="space-y-4">
      {/* Add Task Button/Form */}
      {!isAdding ? (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full rounded-2xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      ) : (
        <Card className="glass p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewTaskTitle('')
                }
              }}
              placeholder="Task title..."
              autoFocus
              className="flex-1 glass rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-para-project/50"
            />
            <Button onClick={handleAddTask} className="rounded-xl">
              Add
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setNewTaskTitle('')
              }}
              variant="ghost"
              className="rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Active Tasks ({activeTasks.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {activeTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="glass p-4 hover:bg-white/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-0.5 text-muted-foreground hover:text-para-project transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`rounded-full text-xs ${priorityColors[task.priority]}`}
                        >
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <Badge variant="outline" className="rounded-full text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Completed ({completedTasks.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {completedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="glass p-4 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-0.5 text-para-project"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-through">{task.title}</p>
                      {task.completed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed {new Date(task.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <Circle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Add Task" to get started
          </p>
        </div>
      )}
    </div>
  )
}
