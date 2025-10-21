'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FolderKanban,
  Layers,
  BookOpen,
  Archive,
  CheckSquare,
  Calendar,
  FileText,
  Sparkles,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Areas', href: '/dashboard/areas', icon: Layers },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
  { name: 'Archives', href: '/dashboard/archives', icon: Archive },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Files', href: '/dashboard/files', icon: Upload },
  { name: 'Weekly Review', href: '/dashboard/review', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card/50 backdrop-blur-xl border-r border-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Sparkles className="w-7 h-7 mr-3 text-para-project animate-pulse" />
        <h1 className="text-xl font-heading font-bold text-gradient">
          PARA Autopilot
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ease-smooth",
                isActive
                  ? "gradient-primary text-white shadow-project"
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground hover:shadow-sm"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center font-medium">
          Powered by Claude Haiku 4.5
        </div>
      </div>
    </div>
  )
}
