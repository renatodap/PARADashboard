'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: () => void
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function AnimatedCheckbox({ 
  checked, 
  onChange, 
  size = 'md',
  color = 'from-para-area to-para-resource'
}: AnimatedCheckboxProps) {
  return (
    <motion.button
      onClick={onChange}
      className={cn(
        'rounded-lg border-2 flex items-center justify-center cursor-pointer relative overflow-hidden',
        sizeClasses[size],
        checked 
          ? `bg-gradient-to-br ${color} border-transparent` 
          : 'border-para-area bg-white/50 dark:bg-white/5'
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        rotate: checked ? [0, -10, 10, 0] : 0
      }}
      transition={{ 
        rotate: { duration: 0.3 },
        scale: { type: "spring", stiffness: 400 }
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: checked ? 1 : 0,
          rotate: checked ? 0 : -180
        }}
        transition={{ 
          type: "spring",
          stiffness: 500,
          damping: 15
        }}
      >
        <Check className={cn('text-white', iconSizes[size])} />
      </motion.div>

      {/* Ripple effect on check */}
      {checked && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${color} rounded-lg`}
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}
