'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { googleAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { SuccessConfetti } from '@/components/animations/SuccessConfetti'
import { X, Mail, ArrowRight, Sparkles, Calendar, Flag, Loader2, CheckCircle2 } from 'lucide-react'

interface EmailToTaskModalProps {
  email: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EmailToTaskModal({ email, isOpen, onClose, onSuccess }: EmailToTaskModalProps) {
  const [converting, setConverting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [createdTask, setCreatedTask] = useState<any>(null)

  const handleConvert = async () => {
    if (!email) return

    setConverting(true)
    try {
      // Use thread_id if available, otherwise use id for both
      const threadId = (email as any).thread_id || email.id
      const result = await googleAPI.emailToTask(email.id, threadId, true)

      setCreatedTask(result.task)
      setShowConfetti(true)
      showToast.success('Task created and synced to Google Tasks!')

      // Close modal after success animation
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 2500)
    } catch (error: any) {
      console.error('Failed to convert email:', error)
      showToast.error(error.message || 'Failed to convert email to task')
    } finally {
      setConverting(false)
    }
  }

  const handleClose = () => {
    setShowConfetti(false)
    setCreatedTask(null)
    onClose()
  }

  if (!email) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl glass rounded-3xl p-6 shadow-2xl"
          >
            {/* Close Button */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-500/10 hover:bg-gray-500/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-heading font-bold">Convert to Task</h2>
                <p className="text-sm text-muted-foreground">AI will extract task details from this email</p>
              </div>
            </div>

            {!createdTask ? (
              <>
                {/* Email Preview */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1">{email.subject || '(No Subject)'}</h4>
                        <p className="text-sm text-muted-foreground">From: {email.from}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {email.snippet}
                    </p>
                  </div>

                  {/* AI Processing Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-para-project" />
                    <span>AI will analyze: Task title, Due date, Priority, and Description</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={converting}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-para-project to-para-area hover:from-para-area hover:to-para-resource gap-2"
                  >
                    {converting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        Create Task
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClose}
                    disabled={converting}
                    variant="outline"
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-2xl font-heading font-bold text-gradient mb-4">Task Created!</h3>

                {/* Task Details */}
                <div className="glass p-6 rounded-2xl text-left mb-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Title</p>
                      <p className="font-semibold">{createdTask.title}</p>
                    </div>
                    {createdTask.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-para-area" />
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="text-sm font-medium">
                            {new Date(createdTask.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {createdTask.priority && (
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-para-project" />
                        <div>
                          <p className="text-sm text-muted-foreground">Priority</p>
                          <Badge className={`
                            rounded-full
                            ${createdTask.priority === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' : ''}
                            ${createdTask.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : ''}
                            ${createdTask.priority === 'low' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                          `}>
                            {createdTask.priority}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Task synced to PARA and Google Tasks
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Success Confetti */}
          <SuccessConfetti show={showConfetti} />
        </div>
      )}
    </AnimatePresence>
  )
}
