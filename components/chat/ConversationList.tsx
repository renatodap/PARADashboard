'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { chatAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { MessageSquarePlus, MessageSquare, Archive, Trash2, Loader2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  is_archived: boolean
  message_count: number
}

interface ConversationListProps {
  selectedId?: string
  onSelect: (id: string | undefined) => void
  className?: string
}

export function ConversationList({ selectedId, onSelect, className = '' }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const { conversations: fetchedConversations } = await chatAPI.getConversations()
      setConversations(fetchedConversations.filter(c => !c.is_archived))
    } catch (error: any) {
      console.error('Failed to load conversations:', error)
      showToast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(null)

    try {
      await chatAPI.archiveConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      showToast.success('Conversation archived')

      if (selectedId === id) {
        onSelect(undefined)
      }
    } catch (error: any) {
      console.error('Failed to archive conversation:', error)
      showToast.error('Failed to archive conversation')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(null)

    if (!confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return
    }

    try {
      await chatAPI.deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      showToast.success('Conversation deleted')

      if (selectedId === id) {
        onSelect(undefined)
      }
    } catch (error: any) {
      console.error('Failed to delete conversation:', error)
      showToast.error('Failed to delete conversation')
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button
          onClick={() => onSelect(undefined)}
          className="w-full rounded-2xl bg-gradient-to-r from-para-project to-para-area hover:from-para-area hover:to-para-resource gap-2"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-para-project" />
            </motion.div>
          </div>
        ) : conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-4"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-para-project" />
            </div>
            <p className="text-sm text-muted-foreground">
              No conversations yet. Start chatting with your AI assistant!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div
                    onClick={() => onSelect(conversation.id)}
                    className={`
                      group relative p-3 rounded-2xl cursor-pointer transition-all
                      ${selectedId === conversation.id
                        ? 'bg-gradient-to-r from-para-project/20 to-para-area/20 border-2 border-para-project/30'
                        : 'glass hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate mb-1">
                          {conversation.title || 'New Conversation'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatTimestamp(conversation.updated_at)}</span>
                          {conversation.message_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{conversation.message_count} messages</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Options Menu */}
                      <DropdownMenu open={menuOpen === conversation.id} onOpenChange={(open) => setMenuOpen(open ? conversation.id : null)}>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl w-8 h-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass">
                          <DropdownMenuItem
                            onClick={(e) => handleArchive(conversation.id, e)}
                            className="gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDelete(conversation.id, e)}
                            className="gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
