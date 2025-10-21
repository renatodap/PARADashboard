'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  variant?: 'stat' | 'task' | 'project' | 'activity'
  className?: string
}

export function SkeletonCard({ variant = 'task', className }: SkeletonCardProps) {
  const shimmer = {
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    backgroundSize: '200% 100%',
  }

  if (variant === 'stat') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('glass p-6 rounded-2xl', className)}
      >
        <div className="space-y-3">
          <motion.div
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={shimmer}
          />
          <motion.div
            className="h-8 w-16 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.1
            }}
            style={shimmer}
          />
          <motion.div
            className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.2
            }}
            style={shimmer}
          />
        </div>
      </motion.div>
    )
  }

  // Default: task variant  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('glass p-4 rounded-2xl', className)}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="w-6 h-6 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={shimmer}
        />
        <div className="flex-1 space-y-2">
          <motion.div
            className="h-5 w-48 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.1
            }}
            style={shimmer}
          />
        </div>
      </div>
    </motion.div>
  )
}
