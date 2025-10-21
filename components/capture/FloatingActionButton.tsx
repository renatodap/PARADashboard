'use client'

import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClick()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClick])

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      {/* Pulsing glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-para-project to-para-area blur-xl opacity-60"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main button */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-primary shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Icons with rotation */}
        <motion.div
          animate={{
            rotate: isHovered ? 90 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          {isHovered ? (
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          ) : (
            <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          )}
        </motion.div>
      </div>

      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10
        }}
        transition={{ duration: 0.2 }}
      >
        Quick Capture
        <span className="ml-2 text-xs text-gray-400">⌘K</span>

        {/* Arrow */}
        <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </motion.div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}
