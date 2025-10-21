'use client'

import { useEffect, useState } from 'react'
import { paraAPI, tasksAPI, reviewAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PARACard } from '@/components/para/PARACard'
import { QuickAdd } from '@/components/para/QuickAdd'
import type { PARAItem, Task, WeeklyReview } from '@/types'
import { Sparkles, TrendingUp, Clock, Target } from 'lucide-react'

export default function HomePage() {
  const [projects, setProjects] = useState<PARAItem[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [latestReview, setLatestReview] = useState<WeeklyReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    todayTasks: 0,
    completedThisWeek: 0,
    upcomingDeadlines: 0
  })

  useEffect(() => {
    loadDashboardData()

    // Listen for new items
    const handler = () => loadDashboardData()
    window.addEventListener('para-item-created', handler)
    return () => window.removeEventListener('para-item-created', handler)
  }, [])

  async function loadDashboardData() {
    try {
      const [projectsData, tasksData, reviewData] = await Promise.all([
        paraAPI.getItems('project'),
        tasksAPI.getTasks(),
        reviewAPI.getReviews()
      ])

      // Filter active projects
      const activeProjects = projectsData.filter(p => p.status === 'active')
      setProjects(activeProjects.slice(0, 3)) // Top 3 projects

      // Filter today's tasks
      const today = new Date().toDateString()
      const todaysTasks = tasksData.filter((t: Task) =>
        t.status !== 'completed' &&
        t.due_date &&
        new Date(t.due_date).toDateString() === today
      )
      setTodayTasks(todaysTasks)

      // Get latest review
      if (reviewData.length > 0) {
        setLatestReview(reviewData[0])
      }

      // Calculate stats
      const completedThisWeek = tasksData.filter((t: Task) =>
        t.status === 'completed' &&
        t.completed_at &&
        new Date(t.completed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      const upcoming = tasksData.filter((t: Task) =>
        t.status !== 'completed' &&
        t.due_date &&
        new Date(t.due_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      ).length

      setStats({
        activeProjects: activeProjects.length,
        todayTasks: todaysTasks.length,
        completedThisWeek,
        upcomingDeadlines: upcoming
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <Sparkles className="w-16 h-16 text-para-project mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-para-project animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-gradient">
            Good {getGreeting()}!
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Your PARA at a glance
        </p>
      </div>

      {/* Quick Add */}
      <QuickAdd onSuccess={loadDashboardData} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass hover:shadow-project transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-para-project/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-para-project" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{stats.activeProjects}</div>
            <p className="text-sm text-muted-foreground mt-1">Active Projects</p>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-area transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-para-area/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-para-area" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{stats.todayTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">Today's Tasks</p>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-resource transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-para-resource/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-para-resource" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{stats.completedThisWeek}</div>
            <p className="text-sm text-muted-foreground mt-1">Completed This Week</p>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-archive transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-para-archive/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-para-archive" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{stats.upcomingDeadlines}</div>
            <p className="text-sm text-muted-foreground mt-1">Upcoming (3 days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-semibold">Active Projects</h2>
            <Button variant="outline" size="sm" className="rounded-2xl">View All →</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <PARACard key={project.id} item={project} />
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-6">Today's Tasks</h2>

        {todayTasks.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No tasks scheduled for today</p>
              <p className="text-sm text-muted-foreground">Add tasks or run auto-schedule to fill your day</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </div>
                  <Button size="sm" className="rounded-2xl">
                    Mark Complete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Review Prompt */}
      {latestReview && (
        <Card className="glass border-l-4 border-para-project">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-para-project" />
              Last Weekly Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{latestReview.summary}</p>
            <Button className="mt-6 rounded-2xl" variant="outline">View Full Review →</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
