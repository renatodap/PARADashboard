'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { FloatingActionButton } from '@/components/capture/FloatingActionButton'
import { QuickCaptureModal } from '@/components/capture/QuickCaptureModal'
import { CommandPalette } from '@/components/command/CommandPalette'
import { FloatingChatButton } from '@/components/chat/FloatingChatButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [captureModalOpen, setCaptureModalOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Global keyboard shortcut for Command Palette (Cmd+Shift+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Listen for open-quick-capture event from command palette
  useEffect(() => {
    const handler = () => setCaptureModalOpen(true)
    window.addEventListener('open-quick-capture', handler as EventListener)
    return () => window.removeEventListener('open-quick-capture', handler as EventListener)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Quick Capture FAB + Modal */}
      <FloatingActionButton onClick={() => setCaptureModalOpen(true)} />
      <QuickCaptureModal
        isOpen={captureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
      />

      {/* Floating Chat Button */}
      <FloatingChatButton />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  )
}
