'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { paraAPI } from '@/lib/api'

export function QuickAdd({ onSuccess }: { onSuccess?: () => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)

    try {
      // AI will auto-classify this
      await paraAPI.createItem({
        title: input,
        description: ''
      })

      setInput('')
      onSuccess?.()
      // Trigger custom event for other components to refresh
      window.dispatchEvent(new CustomEvent('para-item-created'))
    } catch (error) {
      console.error('Failed to create item:', error)
      alert('Failed to create item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Add anything... AI will organize it for you ✨"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !input.trim()}>
        <Sparkles className="w-4 h-4 mr-2" />
        {loading ? 'Adding...' : 'Add'}
      </Button>
    </form>
  )
}
