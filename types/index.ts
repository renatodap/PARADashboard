export type PARAType = 'project' | 'area' | 'resource' | 'archive'
export type PARAStatus = 'active' | 'completed' | 'archived' | 'on_hold'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ReviewStatus = 'draft' | 'completed' | 'skipped'

export interface PARAItem {
  id: string
  user_id: string
  title: string
  description?: string
  para_type: PARAType
  status: PARAStatus
  due_date?: string
  completion_date?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  para_item_id?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  estimated_duration_minutes?: number
  due_date?: string
  scheduled_start?: string
  scheduled_end?: string
  completed_at?: string
  source: string
  source_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start_date: string
  week_end_date: string
  summary?: string
  insights?: {
    summary: string
    projects_update: Record<string, string>
    areas_update: Record<string, string>
    wins: string[]
    rollovers: Array<{
      task_id?: string
      task_title: string
      reason: string
      suggestion: string
    }>
    next_week_proposals: Array<{
      outcome: string
      tasks: string[]
      estimated_hours: number
    }>
    insights: string[]
  }
  completed_tasks_count: number
  user_notes?: string
  status: ReviewStatus
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  external_id?: string
  external_source?: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  is_all_day: boolean
  is_autopilot_created: boolean
  linked_task_id?: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  timezone: string
  onboarding_completed: boolean
  para_preferences: {
    work_hours?: string
    break_frequency?: number
    deep_work_preference?: 'morning' | 'afternoon' | 'evening'
    energy_level?: 'low' | 'medium' | 'high'
    timezone?: string
  }
  created_at: string
  updated_at: string
}

export interface PARAClassification {
  para_type: PARAType
  confidence: number
  reasoning: string
  suggested_next_actions: string[]
  estimated_duration_weeks?: number
}

export interface ScheduledBlock {
  task_id: string
  start_time: string
  end_time: string
  reasoning: string
}

export interface AutoScheduleResponse {
  scheduled_blocks: ScheduledBlock[]
  approval_id: string
  usage: {
    tokens: number
    cost_usd: number
  }
}
