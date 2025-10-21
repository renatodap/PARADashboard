'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Plus, Edit, Trash2, Loader2, FolderKanban, Layers, BookOpen, Archive as ArchiveIcon } from 'lucide-react'
import type { PARAItem } from '@/types'

interface PARAListProps {
  type: 'project' | 'area' | 'resource' | 'archive'
}

const typeConfig = {
  project: {
    title: 'Projects',
    icon: FolderKanban,
    gradient: 'from-para-project to-para-area',
    emptyMessage: 'No projects yet'
  },
  area: {
    title: 'Areas',
    icon: Layers,
    gradient: 'from-para-area to-para-resource',
    emptyMessage: 'No areas yet'
  },
  resource: {
    title: 'Resources',
    icon: BookOpen,
    gradient: 'from-para-resource to-para-archive',
    emptyMessage: 'No resources yet'
  },
  archive: {
    title: 'Archives',
    icon: ArchiveIcon,
    gradient: 'from-para-archive to-para-project',
    emptyMessage: 'No archived items yet'
  }
}

export function PARAList({ type }: PARAListProps) {
  const router = useRouter()
  const [items, setItems] = useState<PARAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '' })

  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    loadItems()
  }, [type])

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await paraAPI.getItems(type)
      setItems(data)
    } catch (error: any) {
      showToast.error('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!createForm.title.trim()) {
      showToast.error('Title is required')
      return
    }

    try {
      const newItem = await paraAPI.createItem({
        title: createForm.title,
        description: createForm.description,
        para_type: type
      })
      setItems(prev => [newItem, ...prev])
      setCreateForm({ title: '', description: '' })
      setCreating(false)
      showToast.success(`${config.title.slice(0, -1)} created!`)
    } catch (error: any) {
      showToast.error('Failed to create item')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editForm.title.trim()) {
      showToast.error('Title is required')
      return
    }

    try {
      const updated = await paraAPI.updateItem(id, editForm)
      setItems(prev => prev.map(item => item.id === id ? updated : item))
      setEditingId(null)
      showToast.success('Updated successfully!')
    } catch (error: any) {
      showToast.error('Failed to update item')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return

    try {
      await paraAPI.deleteItem(id)
      setItems(prev => prev.filter(item => item.id !== id))
      showToast.success('Deleted successfully')
    } catch (error: any) {
      showToast.error('Failed to delete item')
    }
  }

  const startEdit = (item: PARAItem) => {
    setEditingId(item.id)
    setEditForm({ title: item.title, description: item.description || '' })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-gradient">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{items.length} items</p>
          </div>
        </div>

        <Button
          onClick={() => setCreating(!creating)}
          className={`rounded-2xl bg-gradient-to-r ${config.gradient}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          New {config.title.slice(0, -1)}
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="glass p-6">
              <h3 className="font-semibold mb-4">Create New {config.title.slice(0, -1)}</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full glass rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-para-project/50"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full glass rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-para-project/50 resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreate} className={`rounded-2xl bg-gradient-to-r ${config.gradient}`}>
                    Create
                  </Button>
                  <Button onClick={() => setCreating(false)} variant="outline" className="rounded-2xl">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-para-project animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg text-muted-foreground">{config.emptyMessage}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass p-6">
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full glass rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-para-project/50"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full glass rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-para-project/50 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(item.id)} className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500">
                          Save
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" className="rounded-2xl">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div
                        className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/dashboard/${type}s/${item.id}`)}
                      >
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant="outline" className="rounded-full">
                            {item.para_type}
                          </Badge>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(item)
                          }}
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id, item.title)
                          }}
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
