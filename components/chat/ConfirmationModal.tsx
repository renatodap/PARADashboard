'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { chatAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { SuccessConfetti } from '@/components/animations/SuccessConfetti'
import { X, Mail, CheckCircle2, XCircle, Calendar, ListTodo, AlertTriangle } from 'lucide-react'

interface Confirmation {
  id: string
  conversation_id: string
  tool_name: string
  tool_input: any
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface ConfirmationModalProps {
  confirmation: Confirmation | null
  isOpen: boolean
  onClose: () => void
  onApproved?: () => void
}

export function ConfirmationModal({ confirmation, isOpen, onClose, onApproved }: ConfirmationModalProps) {
  const [processing, setProcessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  if (!confirmation) return null

  const getToolIcon = () => {
    switch (confirmation.tool_name) {
      case 'send_email_draft':
        return Mail
      case 'create_task':
        return ListTodo
      case 'get_calendar_events':
        return Calendar
      default:
        return AlertTriangle
    }
  }

  const getToolLabel = () => {
    switch (confirmation.tool_name) {
      case 'send_email_draft':
        return 'Send Email'
      case 'create_task':
        return 'Create Task'
      case 'get_calendar_events':
        return 'Calendar Access'
      default:
        return 'Action Required'
    }
  }

  const getToolColor = () => {
    switch (confirmation.tool_name) {
      case 'send_email_draft':
        return 'from-blue-500 to-indigo-500'
      case 'create_task':
        return 'from-para-project to-para-area'
      case 'get_calendar_events':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-yellow-500 to-orange-500'
    }
  }

  const renderToolPreview = () => {
    switch (confirmation.tool_name) {
      case 'send_email_draft':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">To</p>
              <p className="font-medium">{confirmation.tool_input.to}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Subject</p>
              <p className="font-medium">{confirmation.tool_input.subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Message</p>
              <div className="glass p-4 rounded-2xl max-h-48 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{confirmation.tool_input.body}</p>
              </div>
            </div>
          </div>
        )

      case 'create_task':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Title</p>
              <p className="font-medium">{confirmation.tool_input.title}</p>
            </div>
            {confirmation.tool_input.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{confirmation.tool_input.description}</p>
              </div>
            )}
            <div className="flex gap-4">
              {confirmation.tool_input.due_date && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                  <p className="text-sm font-medium">
                    {new Date(confirmation.tool_input.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {confirmation.tool_input.priority && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <Badge className={`
                    rounded-full
                    ${confirmation.tool_input.priority === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' : ''}
                    ${confirmation.tool_input.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : ''}
                    ${confirmation.tool_input.priority === 'low' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                  `}>
                    {confirmation.tool_input.priority}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="glass p-4 rounded-2xl">
            <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(confirmation.tool_input, null, 2)}
            </pre>
          </div>
        )
    }
  }

  const handleApprove = async () => {
    setProcessing(true)
    try {
      await chatAPI.approveConfirmation(confirmation.id)
      setShowConfetti(true)
      showToast.success('Action approved and executed!')

      setTimeout(() => {
        onApproved?.()
        handleClose()
      }, 2000)
    } catch (error: any) {
      console.error('Failed to approve action:', error)
      showToast.error(error.message || 'Failed to approve action')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    try {
      await chatAPI.rejectConfirmation(confirmation.id, rejectReason || 'User rejected')
      showToast.info('Action cancelled')
      handleClose()
    } catch (error: any) {
      console.error('Failed to reject action:', error)
      showToast.error(error.message || 'Failed to reject action')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setShowConfetti(false)
    setRejectReason('')
    onClose()
  }

  const Icon = getToolIcon()

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
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getToolColor()} flex items-center justify-center`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-heading font-bold">Confirm Action</h2>
                <p className="text-sm text-muted-foreground">{getToolLabel()}</p>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-600 mb-1">Review Before Approving</p>
                <p className="text-sm text-yellow-600/80">
                  Please review the details below carefully before approving this action.
                </p>
              </div>
            </div>

            {/* Tool Preview */}
            <div className="mb-6">
              {renderToolPreview()}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve & Execute
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing}
                variant="outline"
                className="rounded-2xl gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </Button>
            </div>

            {/* Optional Reject Reason */}
            {false && ( // Hidden for now, can be enabled if needed
              <div className="mt-4">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Optional: Why are you rejecting this?"
                  className="w-full glass rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-para-project/50"
                />
              </div>
            )}
          </motion.div>

          {/* Success Confetti */}
          <SuccessConfetti show={showConfetti} />
        </div>
      )}
    </AnimatePresence>
  )
}
