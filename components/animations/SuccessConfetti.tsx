'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/lib/hooks/useWindowSize'

interface SuccessConfettiProps {
  show: boolean
  onComplete?: () => void
}

export function SuccessConfetti({ show, onComplete }: SuccessConfettiProps) {
  const { width, height } = useWindowSize()
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (show) {
      setIsRunning(true)
      const timer = setTimeout(() => {
        setIsRunning(false)
        onComplete?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isRunning) return null

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']}
    />
  )
}
