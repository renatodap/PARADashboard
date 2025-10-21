'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { ArrowLeft, Edit, Trash2, Loader2, FolderKanban, Layers, BookOpen, Archive as ArchiveIcon, CheckCircle } from 'lucide-react'
import { TasksTab } from './TasksTab'
import { NotesTab } from './NotesTab'
import { FilesTab } from './FilesTab'
import { RelationshipsPanel } from './RelationshipsPanel'
import type { PARAItemDetailed, PARAType } from '@/types'

interface PARADetailViewProps {
  itemId: string
  type: PARAType
}

const typeConfig = {
  project: {
    title: 'Project',
    icon: FolderKanban,
    gradient: 'from-para-project to-para-area',
    listPath: '/dashboard/projects'
  },
  area: {
    title: 'Area',
    icon: Layers,
    gradient: 'from-para-area to-para-resource',
    listPath: '/dashboard/areas'
  },
  resource: {
    title: 'Resource',
    icon: BookOpen,
    gradient: 'from-para-resource to-para-archive',
    listPath: '/dashboard/resources'
  },
  archive: {
    title: 'Archive',
    icon: ArchiveIcon,
    gradient: 'from-para-archive to-para-project',
    listPath: '/dashboard/archives'
  }
}

type TabType = 'tasks' | 'notes' | 'files'

export function PARADetailView({ itemId, type }: PARADetailViewProps) {
  const router = useRouter()
  const [item, setItem] = useState<PARAItemDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('tasks')

  const config = typeConfig[type]
  const Icon = config.icon

  const loadItem = async () => {
    setLoading(true)
    try {
      const data = await paraAPI.getItemDetailed(itemId)
      setItem(data)
    } catch (error) {
      showToast.error('Failed to load item')
      router.push(config.listPath)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItem()
  }, [itemId])

  const handleDelete = async () => {
    if (!item) return
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return

    try {
      await paraAPI.deleteItem(itemId)
      showToast.success('Deleted successfully')
      router.push(config.listPath)
    } catch (error) {
      showToast.error('Failed to delete item')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-para-project animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Item not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          onClick={() => router.push(config.listPath)}
          variant="ghost"
          className="mb-4 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {config.title}s
        </Button>

        <Card className="glass p-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold mb-2">{item.title}</h1>
              {item.description && (
                <p className="text-muted-foreground mb-3">{item.description}</p>
              )}

              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="rounded-full">
                  {item.para_type}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {item.status}
                </Badge>
                {item.due_date && (
                  <Badge variant="outline" className="rounded-full">
                    Due {new Date(item.due_date).toLocaleDateString()}
                  </Badge>
                )}
                {item.completion_percentage > 0 && (
                  <Badge variant="outline" className="rounded-full bg-green-50 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {item.completion_percentage}% complete
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={() => router.push(`${config.listPath}?edit=${itemId}`)}
                variant="outline"
                className="rounded-xl"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-para-project">{item.tasks.length}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-para-area">{item.notes.length}</p>
              <p className="text-sm text-muted-foreground">Notes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-para-resource">{item.files.length}</p>
              <p className="text-sm text-muted-foreground">Files</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tabs */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setActiveTab('tasks')}
              variant={activeTab === 'tasks' ? 'default' : 'outline'}
              className="rounded-2xl"
            >
              Tasks ({item.tasks.length})
            </Button>
            <Button
              onClick={() => setActiveTab('notes')}
              variant={activeTab === 'notes' ? 'default' : 'outline'}
              className="rounded-2xl"
            >
              Notes ({item.notes.length})
            </Button>
            <Button
              onClick={() => setActiveTab('files')}
              variant={activeTab === 'files' ? 'default' : 'outline'}
              className="rounded-2xl"
            >
              Files ({item.files.length})
            </Button>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'tasks' && (
              <TasksTab
                itemId={itemId}
                tasks={item.tasks}
                onTasksChange={loadItem}
              />
            )}
            {activeTab === 'notes' && (
              <NotesTab
                itemId={itemId}
                notes={item.notes}
                onNotesChange={loadItem}
              />
            )}
            {activeTab === 'files' && (
              <FilesTab
                itemId={itemId}
                files={item.files}
                onFilesChange={loadItem}
              />
            )}
          </motion.div>
        </div>

        {/* Right Column: Relationships */}
        <div className="lg:col-span-1">
          <RelationshipsPanel
            itemId={itemId}
            relationships={item.relationships}
            onRelationshipsChange={loadItem}
          />
        </div>
      </div>
    </div>
  )
}
