'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { MessageSquare, X } from 'lucide-react'

export function FloatingChatButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  // Don't show on chat page
  if (pathname === '/dashboard/chat') {
    return null
  }

  const handleClick = () => {
    router.push('/dashboard/chat')
  }

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-40 group"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: 0.5
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />

      {/* Main Button */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
        <AnimatePresence mode="wait">
          {isHovered ? (
            <motion.div
              key="hovered"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <MessageSquare className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ rotate: 90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: -90, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              animate-pulse="true"
            >
              <MessageSquare className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Label (on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="glass px-4 py-2 rounded-2xl shadow-lg border border-white/20">
              <p className="text-sm font-semibold">AI Assistant</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
