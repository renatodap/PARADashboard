'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Command, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], description: 'Quick Capture - Add tasks, notes, files' },
      { keys: ['⌘', '⇧', 'K'], description: 'Command Palette - Search & navigate' },
      { keys: ['G', 'H'], description: 'Go to Home' },
      { keys: ['G', 'I'], description: 'Go to AI Insights' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'T'], description: 'Go to Tasks' },
      { keys: ['G', 'R'], description: 'Go to Weekly Review' }
    ]
  },
  {
    category: 'Actions',
    items: [
      { keys: ['N'], description: 'New item (context-aware)' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
      { keys: ['Enter'], description: 'Submit / Confirm' },
      { keys: ['/'], description: 'Focus search' }
    ]
  },
  {
    category: 'Help',
    items: [
      { keys: ['?'], description: 'Show this keyboard shortcuts guide' }
    ]
  }
]

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show help when "?" is pressed (Shift + /)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

        e.preventDefault()
        setIsOpen(true)
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen])

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
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border max-w-3xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center">
                    <Keyboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold">Keyboard Shortcuts</h2>
                    <p className="text-sm text-muted-foreground">Navigate faster with your keyboard</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Shortcuts Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="grid gap-8">
                  {shortcuts.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-lg font-semibold mb-4 text-para-project">
                        {category.category}
                      </h3>
                      <div className="space-y-3">
                        {category.items.map((shortcut, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                          >
                            <span className="text-sm text-foreground">
                              {shortcut.description}
                            </span>
                            <div className="flex gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <kbd
                                  key={keyIndex}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-foreground shadow-sm"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Tip */}
                <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-para-project/10 via-para-area/10 to-para-resource/10 border border-para-project/20">
                  <div className="flex items-start gap-3">
                    <Command className="w-5 h-5 text-para-project flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Pro Tip</p>
                      <p className="text-xs text-muted-foreground">
                        Press <kbd className="px-2 py-1 rounded bg-muted text-foreground">?</kbd> anytime to view these shortcuts.
                        On Windows, <kbd className="px-2 py-1 rounded bg-muted text-foreground">Ctrl</kbd> replaces <kbd className="px-2 py-1 rounded bg-muted text-foreground">⌘</kbd>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
