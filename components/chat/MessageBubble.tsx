'use client'

import { motion } from 'framer-motion'
import { Bot, User, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  toolCalls?: any[]
}

export function MessageBubble({ role, content, timestamp, toolCalls }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
        className={`
          w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
          ${isUser
            ? 'bg-gradient-to-br from-para-project to-para-area'
            : 'glass border border-para-project/20'
          }
        `}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Bot className="w-5 h-5 text-para-project" />
          </motion.div>
        )}
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2 max-w-[80%]`}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, delay: 0.15 }}
          className={`
            rounded-3xl px-5 py-3
            ${isUser
              ? 'bg-gradient-to-br from-para-project to-para-area text-white rounded-br-lg'
              : 'glass rounded-bl-lg'
            }
          `}
        >
          {/* Tool Calls Indicator */}
          {toolCalls && toolCalls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 space-y-2"
            >
              {toolCalls.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span className="text-xs opacity-90">
                    {tool.tool_name === 'search_para_items' && 'Searching PARA items...'}
                    {tool.tool_name === 'search_emails' && 'Searching emails...'}
                    {tool.tool_name === 'search_contacts' && 'Searching contacts...'}
                    {tool.tool_name === 'get_calendar_events' && 'Checking calendar...'}
                    {tool.tool_name === 'create_task' && 'Creating task...'}
                    {tool.tool_name === 'send_email_draft' && 'Drafting email...'}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Message Text */}
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children, className }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-black/20 p-3 rounded-xl my-2 text-sm overflow-x-auto">
                      {children}
                    </code>
                  )
                },
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-xs text-muted-foreground px-2 ${isUser ? 'text-right' : 'text-left'}`}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </motion.div>
      </div>
    </motion.div>
  )
}
