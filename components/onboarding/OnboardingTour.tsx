'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position: 'center' | 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to PARA Autopilot!',
    description: 'Your AI-powered productivity system that automatically organizes your life. Let me show you around in 30 seconds.',
    position: 'center'
  },
  {
    id: 'quick-capture',
    title: '✨ Quick Capture',
    description: 'Press ⌘K (or Ctrl+K) anytime to capture thoughts, tasks, or ideas. AI automatically classifies them into Projects, Areas, Resources, or Archive.',
    targetSelector: '[data-tour="quick-capture-fab"]',
    position: 'left'
  },
  {
    id: 'ai-insights',
    title: '🧠 AI Insights',
    description: 'Your personal AI analyzes 30 days of patterns and proactively suggests what to work on. Morning Briefings appear automatically.',
    targetSelector: '[data-tour="ai-insights-nav"]',
    position: 'right'
  },
  {
    id: 'work-on-now',
    title: '🎯 AI Prioritization',
    description: 'AI prioritizes your tasks based on urgency, energy levels, and time of day. Just follow the list - no thinking required.',
    targetSelector: '[data-tour="work-on-now"]',
    position: 'bottom'
  },
  {
    id: 'rollover-alerts',
    title: '⚠️ Proactive Alerts',
    description: 'AI watches for blockers like stale projects or overdue tasks. Fix issues with one click - no manual review needed.',
    targetSelector: '[data-tour="rollover-alerts"]',
    position: 'left'
  },
  {
    id: 'keyboard-shortcuts',
    title: '⚡ Power User Mode',
    description: 'Press ? anytime to see all keyboard shortcuts. Navigate at the speed of thought.',
    position: 'center'
  },
  {
    id: 'complete',
    title: '🚀 You are All Set!',
    description: 'Start by pressing ⌘K to capture your first thought. AI takes care of the rest. Welcome to productivity on autopilot.',
    position: 'center'
  }
]

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('onboarding-tour-completed')
    if (!hasSeenTour) {
      // Wait 1 second after page load to start tour
      setTimeout(() => setIsActive(true), 1000)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    const step = tourSteps[currentStep]
    if (!step.targetSelector) {
      setTargetRect(null)
      return
    }

    // Find target element and get its position
    const updateTargetPosition = () => {
      const element = document.querySelector(step.targetSelector!)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
      }
    }

    updateTargetPosition()
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)

    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
    }
  }, [currentStep, isActive])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const step = tourSteps[currentStep]
      step.action?.()
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding-tour-completed', 'true')
    setIsActive(false)
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding-tour-completed', 'true')
    setIsActive(false)
  }

  const getTooltipPosition = () => {
    const step = tourSteps[currentStep]

    if (!targetRect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    const spacing = 20
    const positions: Record<string, any> = {
      top: {
        top: targetRect.top - spacing,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translate(-50%, -100%)'
      },
      bottom: {
        top: targetRect.bottom + spacing,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translate(-50%, 0)'
      },
      left: {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.left - spacing,
        transform: 'translate(-100%, -50%)'
      },
      right: {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.right + spacing,
        transform: 'translate(0, -50%)'
      }
    }

    return positions[step.position] || positions.center
  }

  const step = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop with spotlight */}
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: targetRect
                ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(0, 0, 0, 0.7) ${Math.max(targetRect.width, targetRect.height) / 2 + 80}px)`
                : 'rgba(0, 0, 0, 0.7)'
            }}
          />

          {/* Tooltip */}
          <motion.div
            key={currentStep}
            className="fixed z-[101] w-[450px] max-w-[90vw]"
            style={getTooltipPosition()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-para-project/30 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-heading font-bold text-foreground mb-2"
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {step.description}
                  </motion.p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="flex-shrink-0 -mt-2 -mr-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-para-project via-para-area to-para-resource"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <span className="text-xs font-medium text-para-project">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-1 bg-gradient-to-r from-para-project to-para-area text-white"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <Check className="w-4 h-4" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Arrow pointing to target */}
            {targetRect && step.position !== 'center' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute"
                style={{
                  ...(step.position === 'top' && {
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '10px solid hsl(var(--card))'
                  }),
                  ...(step.position === 'bottom' && {
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '10px solid hsl(var(--card))'
                  }),
                  ...(step.position === 'left' && {
                    right: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '10px solid hsl(var(--card))'
                  }),
                  ...(step.position === 'right' && {
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderRight: '10px solid hsl(var(--card))'
                  })
                }}
              />
            )}
          </motion.div>

          {/* Highlight ring around target */}
          {targetRect && (
            <motion.div
              className="fixed z-[99] pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-full h-full rounded-2xl border-4 border-para-project shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse" />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
