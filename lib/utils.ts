import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getPARATypeColor(type: string): string {
  switch (type) {
    case 'project':
      return 'bg-para-project/10 text-para-project-dark border-para-project/30'
    case 'area':
      return 'bg-para-area/10 text-para-area-dark border-para-area/30'
    case 'resource':
      return 'bg-para-resource/10 text-para-resource-dark border-para-resource/30'
    case 'archive':
      return 'bg-para-archive/10 text-para-archive-dark border-para-archive/30'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function getPARAShadowClass(type: string): string {
  switch (type) {
    case 'project':
      return 'shadow-project hover:shadow-project'
    case 'area':
      return 'shadow-area hover:shadow-area'
    case 'resource':
      return 'shadow-resource hover:shadow-resource'
    case 'archive':
      return 'shadow-archive hover:shadow-archive'
    default:
      return 'shadow-sm hover:shadow-md'
  }
}

export function getPARABorderClass(type: string): string {
  switch (type) {
    case 'project':
      return 'border-l-4 border-para-project'
    case 'area':
      return 'border-l-4 border-para-area'
    case 'resource':
      return 'border-l-4 border-para-resource'
    case 'archive':
      return 'border-l-4 border-para-archive'
    default:
      return 'border-l-4 border-muted'
  }
}
