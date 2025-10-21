'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ConversationList } from '@/components/chat/ConversationList'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed lg:relative lg:translate-x-0 w-80 h-full glass border-r border-white/10 z-50 lg:z-0"
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ConversationList
          selectedId={selectedConversationId}
          onSelect={(id) => {
            setSelectedConversationId(id)
            setSidebarOpen(false)
          }}
        />
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="glass border-b border-white/10 px-6 py-4 flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-heading font-bold text-gradient">
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedConversationId ? 'Continue your conversation' : 'Start a new conversation'}
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            key={selectedConversationId || 'new'}
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}
