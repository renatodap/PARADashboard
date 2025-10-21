'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  FileText,
  CheckSquare,
  Calendar,
  Brain,
  Zap,
  Target,
  Folder,
  Archive,
  Settings,
  Clock,
  TrendingUp,
  Mail,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchAPI } from '@/lib/api'
import type { PARAItem, Task } from '@/types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface Command {
  id: string
  label: string
  description?: string
  icon: any
  category: 'action' | 'navigate' | 'create'
  shortcut?: string
  action: () => void
  keywords?: string[]
}

const commands: Command[] = [
  // Actions
  {
    id: 'quick-capture',
    label: 'Quick Capture',
    description: 'Capture a new item',
    icon: Sparkles,
    category: 'action',
    shortcut: 'C',
    action: () => window.dispatchEvent(new CustomEvent('open-quick-capture')),
    keywords: ['add', 'new', 'capture', 'create']
  },
  {
    id: 'auto-schedule',
    label: 'Auto-Schedule Day',
    description: 'Let AI fill your calendar',
    icon: Zap,
    category: 'action',
    shortcut: 'A',
    action: () => console.log('Auto-schedule'),
    keywords: ['schedule', 'ai', 'auto', 'plan']
  },
  {
    id: 'weekly-review',
    label: 'Start Weekly Review',
    description: 'Review your week',
    icon: Brain,
    category: 'action',
    shortcut: 'R',
    action: () => console.log('Weekly review'),
    keywords: ['review', 'reflect', 'weekly']
  },
  {
    id: 'sync-google-tasks',
    label: 'Sync Google Tasks',
    description: 'Sync tasks with Google',
    icon: RefreshCw,
    category: 'action',
    shortcut: 'G',
    action: () => window.dispatchEvent(new CustomEvent('sync-google-tasks')),
    keywords: ['google', 'sync', 'tasks', 'calendar']
  },
  {
    id: 'check-gmail',
    label: 'Check Gmail',
    description: 'View unread emails',
    icon: Mail,
    category: 'action',
    action: () => {
      window.location.href = '/dashboard'
      setTimeout(() => {
        const gmailWidget = document.querySelector('[data-gmail-widget]')
        gmailWidget?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    },
    keywords: ['gmail', 'email', 'inbox', 'google']
  },
  {
    id: 'open-chat',
    label: 'AI Assistant',
    description: 'Chat with your AI assistant',
    icon: MessageSquare,
    category: 'action',
    shortcut: '/',
    action: () => window.location.href = '/dashboard/chat',
    keywords: ['chat', 'ai', 'assistant', 'help', 'ask']
  },

  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    description: 'Go to dashboard',
    icon: Target,
    category: 'navigate',
    shortcut: 'D',
    action: () => window.location.href = '/dashboard',
    keywords: ['home', 'overview']
  },
  {
    id: 'nav-calendar',
    label: 'Calendar',
    description: 'View your schedule',
    icon: Calendar,
    category: 'navigate',
    shortcut: 'K',
    action: () => window.location.href = '/dashboard/calendar',
    keywords: ['schedule', 'timeline', 'plan']
  },
  {
    id: 'nav-projects',
    label: 'Projects',
    description: 'View all projects',
    icon: Folder,
    category: 'navigate',
    action: () => window.location.href = '/dashboard/para/projects',
    keywords: ['para', 'folder']
  },
  {
    id: 'nav-tasks',
    label: 'Tasks',
    description: 'View all tasks',
    icon: CheckSquare,
    category: 'navigate',
    action: () => window.location.href = '/dashboard/tasks',
    keywords: ['todo', 'task', 'list']
  },
  {
    id: 'nav-chat',
    label: 'Chat',
    description: 'Go to AI chat',
    icon: MessageSquare,
    category: 'navigate',
    action: () => window.location.href = '/dashboard/chat',
    keywords: ['chat', 'ai', 'assistant', 'conversation']
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    description: 'Manage integrations',
    icon: Settings,
    category: 'navigate',
    action: () => window.location.href = '/dashboard/settings',
    keywords: ['settings', 'config', 'google', 'integrations']
  },

  // Create
  {
    id: 'create-project',
    label: 'New Project',
    description: 'Create a new project',
    icon: Target,
    category: 'create',
    action: () => console.log('New project'),
    keywords: ['add', 'create', 'project']
  },
  {
    id: 'create-task',
    label: 'New Task',
    description: 'Create a new task',
    icon: CheckSquare,
    category: 'create',
    action: () => console.log('New task'),
    keywords: ['add', 'create', 'task', 'todo']
  }
]

const categoryLabels = {
  action: 'Quick Actions',
  navigate: 'Navigate',
  create: 'Create New'
}

const categoryColors = {
  action: 'text-para-project',
  navigate: 'text-para-area',
  create: 'text-para-resource'
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<{
    para_items: PARAItem[]
    tasks: Task[]
  }>({ para_items: [], tasks: [] })
  const [isSearching, setIsSearching] = useState(false)

  // Search backend when query changes
  useEffect(() => {
    const searchBackend = async () => {
      if (search.length < 2) {
        setSearchResults({ para_items: [], tasks: [] })
        return
      }

      setIsSearching(true)
      try {
        const results = await searchAPI.all(search, 5)
        setSearchResults(results)
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults({ para_items: [], tasks: [] })
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchBackend, 300)
    return () => clearTimeout(debounce)
  }, [search])

  // Filter commands based on search
  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase()
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some((k) => k.includes(searchLower))
    )
  })

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, Command[]>)

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Navigate with arrow keys and Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const command = filteredCommands[selectedIndex]
        if (command) {
          command.action()
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const handleCommandClick = (command: Command) => {
    command.action()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            className="fixed inset-x-0 top-0 sm:inset-x-auto sm:left-1/2 sm:top-[10vh] sm:-translate-x-1/2
                       w-full sm:w-[640px] sm:max-h-[80vh] z-50"
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <div className="glass h-screen sm:h-auto sm:rounded-3xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-6 pb-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type a command or search..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border-2 border-border
                             focus:border-para-project focus:ring-4 focus:ring-para-project/20
                             text-lg transition-all duration-300 placeholder:text-muted-foreground/60"
                    autoFocus
                  />
                </div>
              </div>

              {/* Commands List */}
              <div className="overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[60vh] p-4">
                {isSearching && search.length >= 2 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center animate-spin">
                      <RefreshCw className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : search.length >= 2 && (searchResults.para_items.length > 0 || searchResults.tasks.length > 0) ? (
                  <div className="space-y-6">
                    {/* Search Results - PARA Items */}
                    {searchResults.para_items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 text-para-project">
                          PARA Items
                        </p>
                        <div className="space-y-1">
                          {searchResults.para_items.map((item) => (
                            <motion.button
                              key={item.id}
                              onClick={() => {
                                window.location.href = `/dashboard/${item.para_type}s/${item.id}`
                                onClose()
                              }}
                              className="w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-200
                                         bg-white/50 dark:bg-white/5 border-2 border-transparent hover:border-border"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center">
                                <Folder className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{item.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.description || `${item.para_type} • ${item.status}`}
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs rounded bg-para-project/10 text-para-project font-medium">
                                {item.para_type}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Results - Tasks */}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 text-para-area">
                          Tasks
                        </p>
                        <div className="space-y-1">
                          {searchResults.tasks.map((task) => (
                            <motion.button
                              key={task.id}
                              onClick={() => {
                                window.location.href = `/dashboard/tasks`
                                onClose()
                              }}
                              className="w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-200
                                         bg-white/50 dark:bg-white/5 border-2 border-transparent hover:border-border"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center">
                                <CheckSquare className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{task.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {task.description || `${task.priority} priority • ${task.status}`}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded font-medium ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : Object.entries(groupedCommands).length === 0 && search.length > 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project/20 to-para-area/20 flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedCommands).map(([category, categoryCommands]) => {
                      let currentIndex = 0
                      for (let i = 0; i < filteredCommands.length; i++) {
                        if (filteredCommands[i] === categoryCommands[0]) {
                          break
                        }
                        currentIndex++
                      }

                      return (
                        <div key={category}>
                          <p className={cn(
                            'text-xs font-semibold uppercase tracking-wider mb-2 px-2',
                            categoryColors[category as keyof typeof categoryColors]
                          )}>
                            {categoryLabels[category as keyof typeof categoryLabels]}
                          </p>

                          <div className="space-y-1">
                            {categoryCommands.map((command, idx) => {
                              const Icon = command.icon
                              const globalIndex = currentIndex + idx
                              const isSelected = globalIndex === selectedIndex

                              return (
                                <motion.button
                                  key={command.id}
                                  onClick={() => handleCommandClick(command)}
                                  className={cn(
                                    'w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-200',
                                    isSelected
                                      ? 'bg-gradient-to-r from-para-project/20 to-para-area/20 border-2 border-para-project/30'
                                      : 'bg-white/50 dark:bg-white/5 border-2 border-transparent hover:border-border'
                                  )}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className={cn(
                                    'w-10 h-10 rounded-2xl flex items-center justify-center',
                                    isSelected
                                      ? 'bg-gradient-to-br from-para-project to-para-area'
                                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
                                  )}>
                                    <Icon className={cn(
                                      'w-5 h-5',
                                      isSelected ? 'text-white' : 'text-muted-foreground'
                                    )} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground">{command.label}</p>
                                    {command.description && (
                                      <p className="text-sm text-muted-foreground truncate">
                                        {command.description}
                                      </p>
                                    )}
                                  </div>

                                  {command.shortcut && (
                                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                                      {command.shortcut}
                                    </kbd>
                                  )}
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer Hint */}
              <div className="p-4 border-t border-border/50 text-xs text-muted-foreground text-center">
                Use <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd> to navigate,
                <kbd className="px-1.5 py-0.5 bg-muted rounded ml-1">Enter</kbd> to select,
                <kbd className="px-1.5 py-0.5 bg-muted rounded ml-1">Esc</kbd> to close
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
