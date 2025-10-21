'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, FileText, CheckSquare, Upload, Camera, Mic, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { SuccessConfetti } from '@/components/animations/SuccessConfetti'

interface QuickCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type CaptureType = 'auto' | 'note' | 'task' | 'file' | 'photo'

const captureTypes = [
  { id: 'auto' as CaptureType, icon: Sparkles, label: 'Auto', color: 'from-para-project to-para-area' },
  { id: 'note' as CaptureType, icon: FileText, label: 'Note', color: 'from-para-resource to-para-archive' },
  { id: 'task' as CaptureType, icon: CheckSquare, label: 'Task', color: 'from-para-area to-para-resource' },
  { id: 'file' as CaptureType, icon: Upload, label: 'File', color: 'from-para-project to-para-resource' },
  { id: 'photo' as CaptureType, icon: Camera, label: 'Photo', color: 'from-para-area to-para-project' }
]

export function QuickCaptureModal({ isOpen, onClose, onSuccess }: QuickCaptureModalProps) {
  const [input, setInput] = useState('')
  const [selectedType, setSelectedType] = useState<CaptureType>('auto')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)

    try {
      // For now, use the existing PARA creation endpoint
      // TODO: Replace with /api/capture/quick when backend is ready
      const result = await paraAPI.createItem({
        title: input,
        description: selectedType !== 'auto' ? `Type: ${selectedType}` : ''
      })

      // Success animation and notification
      setShowConfetti(true)
      showToast.success(`✨ Captured! AI classified as ${result.para_type}`)

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('para-item-created'))
      onSuccess?.()

      // Reset and close after confetti
      setTimeout(() => {
        setInput('')
        setSelectedType('auto')
        setAiSuggestion('')
        setShowConfetti(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to capture:', error)
      showToast.error('Failed to capture. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceCapture = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording when backend endpoint is ready
    showToast.info('Voice capture coming soon!')
  }

  // AI suggestion based on input
  useEffect(() => {
    if (input.length > 10) {
      // Simulate AI suggestion
      const suggestions = [
        'This looks like a project - add deadline?',
        'Sounds like an ongoing area',
        'Great resource to save!',
        'I can schedule this for you'
      ]
      setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
    } else {
      setAiSuggestion('')
    }
  }, [input])

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

          {/* Modal */}
          <motion.div
            className="fixed inset-x-0 top-0 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                       w-full sm:w-[600px] sm:max-h-[80vh] z-50 flex flex-col"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <div className="glass h-screen sm:h-auto sm:rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-para-project" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold">Quick Capture</h2>
                    <p className="text-sm text-muted-foreground">What's on your mind?</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type anything... 'Buy groceries tomorrow', 'Learn React', 'Meeting notes'..."
                    className="w-full h-32 sm:h-40 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border-2 border-border
                             focus:border-para-project focus:ring-4 focus:ring-para-project/20
                             resize-none text-lg transition-all duration-300 placeholder:text-muted-foreground/60"
                    disabled={isProcessing}
                  />

                  {/* Voice button */}
                  <motion.button
                    type="button"
                    onClick={handleVoiceCapture}
                    className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center
                               transition-all duration-300 ${
                                 isRecording
                                   ? 'bg-red-500 text-white'
                                   : 'bg-para-area/10 text-para-area hover:bg-para-area/20'
                               }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                  </motion.button>
                </div>

                {/* AI Suggestion */}
                <AnimatePresence>
                  {aiSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-para-project/10 border border-para-project/20"
                    >
                      <Sparkles className="w-4 h-4 text-para-project flex-shrink-0" />
                      <p className="text-sm text-para-project">{aiSuggestion}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Type Selector */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Capture as:
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {captureTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = selectedType === type.id

                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300
                                     ${isSelected
                                       ? 'border-para-project bg-gradient-to-br ' + type.color + ' text-white shadow-lg'
                                       : 'border-border bg-white/50 dark:bg-white/5 hover:border-para-project/50'
                                     }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className="w-full h-14 rounded-2xl text-lg font-semibold"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Capture
                    </>
                  )}
                </Button>

                {/* Keyboard Hint */}
                <p className="text-xs text-center text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> to capture •
                  <kbd className="px-2 py-1 bg-muted rounded ml-2">Esc</kbd> to close
                </p>
              </form>
            </div>
          </motion.div>

          {/* Success Confetti */}
          <SuccessConfetti show={showConfetti} />
        </>
      )}
    </AnimatePresence>
  )
}
