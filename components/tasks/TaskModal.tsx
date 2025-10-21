'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, Clock, Flag, Link2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { tasksAPI, paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import type { Task, PARAItem } from '@/types'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  task?: Task | null
  mode: 'create' | 'edit'
}

export function TaskModal({ open, onClose, onSave, task, mode }: TaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending')
  const [dueDate, setDueDate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [paraItemId, setParaItemId] = useState('')
  const [paraItems, setParaItems] = useState<PARAItem[]>([])

  useEffect(() => {
    if (open) {
      loadParaItems()
      if (mode === 'edit' && task) {
        setTitle(task.title)
        setDescription(task.description || '')
        setPriority(task.priority)
        setStatus(task.status)
        setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
        setEstimatedDuration(task.estimated_duration_minutes?.toString() || '')
        setParaItemId(task.para_item_id || '')
      } else {
        resetForm()
      }
    }
  }, [open, task, mode])

  const loadParaItems = async () => {
    try {
      const items = await paraAPI.getItems()
      setParaItems(items)
    } catch (error) {
      console.error('Failed to load PARA items:', error)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('pending')
    setDueDate('')
    setEstimatedDuration('')
    setParaItemId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      showToast.error('Title is required')
      return
    }

    setLoading(true)
    try {
      const taskData: Partial<Task> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimated_duration_minutes: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        para_item_id: paraItemId || undefined,
      }

      if (mode === 'edit' && task) {
        await tasksAPI.updateTask(task.id, taskData)
        showToast.success('Task updated successfully')
      } else {
        await tasksAPI.createTask(taskData)
        showToast.success('Task created successfully')
      }

      onSave()
      onClose()
    } catch (error) {
      showToast.error(`Failed to ${mode} task`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task || mode !== 'edit') return

    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return

    setLoading(true)
    try {
      await tasksAPI.deleteTask(task.id)
      showToast.success('Task deleted successfully')
      onSave()
      onClose()
    } catch (error) {
      showToast.error('Failed to delete task')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Sparkles className="w-6 h-6 text-para-project" />
                Create New Task
              </>
            ) : (
              <>
                <Flag className="w-6 h-6 text-para-area" />
                Edit Task
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="mt-1.5 rounded-xl"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="mt-1.5 rounded-xl min-h-[100px]"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger id="priority" className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger id="status" className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 30"
                className="mt-1.5 rounded-xl"
                min="1"
              />
            </div>
          </div>

          {/* PARA Item Link */}
          <div>
            <Label htmlFor="paraItem" className="text-sm font-medium flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              Link to PARA Item
            </Label>
            <Select value={paraItemId} onValueChange={setParaItemId}>
              <SelectTrigger id="paraItem" className="mt-1.5 rounded-xl">
                <SelectValue placeholder="None (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {paraItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase">
                        {item.para_type}
                      </span>
                      {item.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {mode === 'edit' && task && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Task
              </Button>
            )}
            {mode === 'create' && <div />}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-para-project to-para-area"
              >
                {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Task' : 'Save Changes')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
