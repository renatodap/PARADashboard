import { supabase } from './supabase'
import type { PARAItem, Task, WeeklyReview, PARAClassification, AutoScheduleResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.statusText} - ${error}`)
  }

  return response.json()
}

// PARA API
export const paraAPI = {
  getItems: (type?: string): Promise<PARAItem[]> =>
    apiClient(`/api/para${type ? `?para_type=${type}` : ''}`),

  getItem: (id: string): Promise<PARAItem> =>
    apiClient(`/api/para/${id}`),

  createItem: (item: Partial<PARAItem>): Promise<PARAItem> =>
    apiClient('/api/para', {
      method: 'POST',
      body: JSON.stringify(item)
    }),

  updateItem: (id: string, updates: Partial<PARAItem>): Promise<PARAItem> =>
    apiClient(`/api/para/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteItem: (id: string): Promise<void> =>
    apiClient(`/api/para/${id}`, {
      method: 'DELETE'
    }),

  classify: (title: string, description?: string, context?: string): Promise<{ classification: PARAClassification, usage: any }> =>
    apiClient('/api/para/classify', {
      method: 'POST',
      body: JSON.stringify({ title, description, context })
    }),
}

// Tasks API
export const tasksAPI = {
  getTasks: (status?: string): Promise<Task[]> =>
    apiClient(`/api/tasks${status ? `?status=${status}` : ''}`),

  getTask: (id: string): Promise<Task> =>
    apiClient(`/api/tasks/${id}`),

  getUnscheduled: (): Promise<Task[]> =>
    apiClient('/api/tasks/unscheduled'),

  createTask: (task: Partial<Task>): Promise<Task> =>
    apiClient('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    }),

  updateTask: (id: string, updates: Partial<Task>): Promise<Task> =>
    apiClient(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteTask: (id: string): Promise<void> =>
    apiClient(`/api/tasks/${id}`, {
      method: 'DELETE'
    }),

  autoSchedule: (taskIds?: string[], preferences?: any): Promise<AutoScheduleResponse> =>
    apiClient('/api/tasks/schedule', {
      method: 'POST',
      body: JSON.stringify({ task_ids: taskIds, preferences })
    }),
}

// Weekly Review API
export const reviewAPI = {
  getReviews: (): Promise<WeeklyReview[]> =>
    apiClient('/api/review'),

  getReview: (id: string): Promise<WeeklyReview> =>
    apiClient(`/api/review/${id}`),

  getByWeek: (weekStart: string): Promise<WeeklyReview> =>
    apiClient(`/api/review/week/${weekStart}`),

  generate: (weekStart?: string): Promise<{ review_id: string, review_data: any, usage: any }> =>
    apiClient('/api/review/generate', {
      method: 'POST',
      body: JSON.stringify({ week_start_date: weekStart })
    }),

  update: (id: string, updates: Partial<WeeklyReview>): Promise<WeeklyReview> =>
    apiClient(`/api/review/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
}

// Search API
export const searchAPI = {
  similar: (query: string, limit?: number): Promise<{ query: string, results: any[], count: number }> =>
    apiClient(`/api/search/similar?query=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`),

  all: (query: string, limit?: number): Promise<{ para_items: any[], tasks: any[], query: string }> =>
    apiClient(`/api/search/all?query=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`),

  embedPARAItems: (): Promise<{ success: number, failed: number, total: number }> =>
    apiClient('/api/search/embed/para-items', {
      method: 'POST'
    }),
}

// Integrations API
export const integrationsAPI = {
  getIntegrations: (): Promise<any[]> =>
    apiClient('/api/integrations'),

  connect: (type: string, accessToken: string, refreshToken?: string): Promise<any> =>
    apiClient(`/api/integrations/${type}/connect`, {
      method: 'POST',
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken
      })
    }),

  disconnect: (type: string): Promise<any> =>
    apiClient(`/api/integrations/${type}/disconnect`, {
      method: 'POST'
    }),

  sync: (type: string): Promise<any> =>
    apiClient(`/api/integrations/${type}/sync`, {
      method: 'POST'
    }),
}

// Files API
export const filesAPI = {
  upload: async (file: File): Promise<{ file: any, para_item: any, usage: any }> => {
    const { data: { session } } = await supabase.auth.getSession()

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API error: ${response.statusText} - ${error}`)
    }

    return response.json()
  },

  getFiles: (params?: { file_type?: string, para_type?: string }): Promise<{ files: any[] }> => {
    const queryParams = new URLSearchParams()
    if (params?.file_type) queryParams.append('file_type', params.file_type)
    if (params?.para_type) queryParams.append('para_type', params.para_type)
    const queryString = queryParams.toString()

    return apiClient(`/api/files/${queryString ? `?${queryString}` : ''}`)
  },

  getFile: (id: string): Promise<any> =>
    apiClient(`/api/files/${id}`),

  deleteFile: (id: string): Promise<void> =>
    apiClient(`/api/files/${id}`, {
      method: 'DELETE'
    }),

  getStats: (): Promise<{ total_files: number, total_size_bytes: number, total_size_mb: number, by_type: any[] }> =>
    apiClient('/api/files/stats/storage'),

  archiveLink: (url: string): Promise<{ file: any, para_item: any, usage: any }> =>
    apiClient('/api/files/archive-link', {
      method: 'POST',
      body: JSON.stringify({ url })
    }),
}

// Google API
export const googleAPI = {
  // OAuth
  getOAuthUrl: (): Promise<{ auth_url: string, state: string, expires_in: number }> =>
    apiClient('/api/oauth/google/init'),

  revokeAccess: (): Promise<{ message: string }> =>
    apiClient('/api/oauth/google/revoke', {
      method: 'DELETE'
    }),

  // Gmail
  getUnreadEmails: (maxResults?: number): Promise<{ count: number, emails: any[] }> =>
    apiClient(`/api/google/gmail/unread${maxResults ? `?max_results=${maxResults}` : ''}`),

  searchEmails: (query: string, maxResults?: number, after?: string): Promise<{ count: number, emails: any[] }> =>
    apiClient('/api/google/gmail/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        max_results: maxResults,
        after
      })
    }),

  emailToTask: (emailId: string, threadId: string, createGoogleTask?: boolean): Promise<{
    message: string,
    task: any,
    google_task?: any
  }> =>
    apiClient('/api/google/gmail/email-to-task', {
      method: 'POST',
      body: JSON.stringify({
        email_id: emailId,
        thread_id: threadId,
        create_google_task: createGoogleTask
      })
    }),

  // Google Tasks
  getGoogleTasks: (): Promise<{ count: number, tasks: any[] }> =>
    apiClient('/api/google/tasks/google'),

  syncTasks: (taskIds?: string[], syncToGoogle?: boolean, syncFromGoogle?: boolean): Promise<{
    message: string,
    synced_to_google: number,
    synced_from_google: number,
    tasks_to_google: any[],
    tasks_from_google: any[]
  }> =>
    apiClient('/api/google/tasks/sync', {
      method: 'POST',
      body: JSON.stringify({
        task_ids: taskIds,
        sync_to_google: syncToGoogle,
        sync_from_google: syncFromGoogle
      })
    }),
}
