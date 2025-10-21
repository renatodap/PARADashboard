'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { FloatingActionButton } from '@/components/capture/FloatingActionButton'
import { QuickCaptureModal } from '@/components/capture/QuickCaptureModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [captureModalOpen, setCaptureModalOpen] = useState(false)

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
    </div>
  )
}
