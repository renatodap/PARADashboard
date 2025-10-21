'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, Settings, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentUser, signOut } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function TopNav() {
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
    router.push('/login')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center px-6 justify-between">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items, tasks, or ask AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-2xl bg-white/50 dark:bg-white/5 border-border focus-visible:ring-para-project/20"
          />
        </div>
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
          <Bell className="w-5 h-5" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" onClick={() => router.push('/settings')} className="hover:scale-105 transition-transform">
          <Settings className="w-5 h-5" />
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
          <div className="text-right">
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
