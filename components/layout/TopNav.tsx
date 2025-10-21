'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, Settings, LogOut, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentUser, signOut } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface TopNavProps {
  onMenuClick?: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/auth/login')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center px-4 sm:px-6 justify-between gap-2 sm:gap-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden hover:scale-105 transition-transform"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-11 h-10 sm:h-11 rounded-2xl bg-white/50 dark:bg-white/5 border-border focus-visible:ring-para-project/20 text-sm"
          />
        </div>
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform hidden sm:flex">
          <Bell className="w-5 h-5" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/settings')} className="hover:scale-105 transition-transform hidden sm:flex">
          <Settings className="w-5 h-5" />
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-2 sm:gap-3 sm:ml-4 sm:pl-4 sm:border-l border-border">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-foreground">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign out"
            className="hover:scale-105 transition-transform hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
