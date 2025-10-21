'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { chatAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Send, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  tool_calls?: any[]
}

interface ChatInterfaceProps {
  conversationId?: string
  onConversationCreated?: (id: string) => void
  className?: string
}

export function ChatInterface({ conversationId, onConversationCreated, className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Load conversation history if conversationId provided
  useEffect(() => {
    if (conversationId) {
      loadConversation()
    }
  }, [conversationId])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const loadConversation = async () => {
    if (!conversationId) return

    setLoading(true)
    try {
      const { messages: conversationMessages } = await chatAPI.getConversation(conversationId)
      setMessages(conversationMessages)
    } catch (error: any) {
      console.error('Failed to load conversation:', error)
      showToast.error('Failed to load conversation history')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])
    setTyping(true)

    try {
      const response = await chatAPI.sendMessage(userMessage, conversationId)

      // Notify parent if this created a new conversation
      if (!conversationId && response.conversation_id) {
        onConversationCreated?.(response.conversation_id)
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
        tool_calls: response.tool_calls
      }

      setMessages(prev => [...prev, assistantMessage])

      // Show pending confirmations if any
      if (response.pending_confirmations && response.pending_confirmations.length > 0) {
        showToast.info(`${response.pending_confirmations.length} action(s) require your approval`)
      }
    } catch (error: any) {
      console.error('Failed to send message:', error)
      showToast.error(error.message || 'Failed to send message')

      // Remove the temporary user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-para-project" />
            </motion.div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <motion.div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center mb-6"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-heading font-bold text-gradient mb-3">
              Your AI Assistant
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Ask me anything about your projects, tasks, emails, or calendar. I can search, create tasks, draft emails, and more!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "What projects am I working on?",
                "When am I free this week?",
                "Email Alice about Q4 budget",
                "Show me high priority tasks"
              ].map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput(suggestion)}
                  className="glass px-4 py-2 rounded-2xl text-sm hover:bg-white/10 transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.created_at}
                toolCalls={message.tool_calls}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {typing && <TypingIndicator />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={loading}
              rows={1}
              className="w-full glass rounded-2xl px-5 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-para-project/50 transition-all max-h-32 overflow-y-auto"
              style={{
                minHeight: '48px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />

            {/* AI Sparkle Icon */}
            <motion.div
              className="absolute right-4 top-3 pointer-events-none"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-para-project opacity-50" />
            </motion.div>
          </div>

          {/* Send Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area hover:from-para-area hover:to-para-resource disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/10">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
