'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { paraAPI, tasksAPI, reviewAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PARACard } from '@/components/para/PARACard'
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline'
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid'
import { GmailInboxWidget } from '@/components/google/GmailInboxWidget'
import { EmailToTaskModal } from '@/components/google/EmailToTaskModal'
import { AnimatedCheckbox } from '@/components/animations/AnimatedCheckbox'
import { SkeletonCard } from '@/components/loading/SkeletonCard'
import { SuccessConfetti } from '@/components/animations/SuccessConfetti'
import { showToast } from '@/lib/toast'
import type { PARAItem, Task, WeeklyReview } from '@/types'
import { Sparkles, TrendingUp, Clock, Target, Brain, Zap, Calendar } from 'lucide-react'

export default function HomePage() {
  const [projects, setProjects] = useState<PARAItem[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [latestReview, setLatestReview] = useState<WeeklyReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [stats, setStats] = useState({
    activeProjects: 0,
    todayTasks: 0,
    completedThisWeek: 0,
    upcomingDeadlines: 0
  })

  const handleTaskComplete = async (taskId: string) => {
    try {
      await tasksAPI.updateTask(taskId, { status: 'completed', completed_at: new Date().toISOString() })
      setShowConfetti(true)
      showToast.success('Task completed! 🎉')
      setTimeout(() => setShowConfetti(false), 3000)
      loadDashboardData()
    } catch (error) {
      console.error('Failed to complete task:', error)
      showToast.error('Failed to complete task')
    }
  }

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
      <div className="space-y-8 max-w-7xl">
        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} variant="stat" />
          ))}
        </div>

        {/* Skeleton Projects */}
        <div>
          <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} variant="project" />
            ))}
          </div>
        </div>

        {/* Skeleton Tasks */}
        <div>
          <div className="h-8 w-40 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} variant="task" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Hero Header with AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-para-project" />
              </motion.div>
              <h1 className="text-2xl sm:text-4xl font-heading font-bold text-gradient">
                Good {getGreeting()}!
              </h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground">
              {getAIInsight(stats)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-2xl gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Schedule</span>
            </Button>
            <Button variant="outline" className="rounded-2xl gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Review</span>
            </Button>
          </div>
        </div>

        {/* AI Insight Banner */}
        {stats.todayTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-para-project/10 via-para-area/10 to-para-resource/10 border border-para-project/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">AI Suggestion</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.todayTasks > 5
                    ? "You have a busy day ahead. Consider time-blocking your calendar for better focus."
                    : "Great job! You're on track for today. Focus on your top 3 priorities."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <Card className="glass hover:shadow-project hover:-translate-y-1 transition-all duration-300 border-l-4 border-para-project/30 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-para-project/20 to-para-project/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Target className="w-5 h-5 text-para-project" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold bg-gradient-to-br from-para-project to-para-project/70 bg-clip-text text-transparent">
                {stats.activeProjects}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Active Projects</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <Card className="glass hover:shadow-area hover:-translate-y-1 transition-all duration-300 border-l-4 border-para-area/30 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-para-area/20 to-para-area/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Clock className="w-5 h-5 text-para-area" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold bg-gradient-to-br from-para-area to-para-area/70 bg-clip-text text-transparent">
                {stats.todayTasks}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Today's Tasks</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <Card className="glass hover:shadow-resource hover:-translate-y-1 transition-all duration-300 border-l-4 border-para-resource/30 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-para-resource/20 to-para-resource/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <TrendingUp className="w-5 h-5 text-para-resource" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold bg-gradient-to-br from-para-resource to-para-resource/70 bg-clip-text text-transparent">
                {stats.completedThisWeek}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Completed This Week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <Card className="glass hover:shadow-archive hover:-translate-y-1 transition-all duration-300 border-l-4 border-para-archive/30 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-para-archive/20 to-para-archive/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Calendar className="w-5 h-5 text-para-archive" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold bg-gradient-to-br from-para-archive to-para-archive/70 bg-clip-text text-transparent">
                {stats.upcomingDeadlines}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Upcoming (3 days)</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Active Projects */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-2xl font-heading font-semibold">Active Projects</h2>
            </div>
            <Button variant="outline" size="sm" className="rounded-2xl hover:scale-105 transition-transform">
              View All →
            </Button>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <PARACard item={project} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Clock className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl font-heading font-semibold">Today's Tasks</h2>
          </div>
        </div>

        {todayTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass border-2 border-dashed border-para-area/30">
              <CardContent className="py-16 text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-lg font-medium text-foreground mb-2">No tasks scheduled for today</p>
                <p className="text-sm text-muted-foreground mb-4">Add tasks or run auto-schedule to fill your day</p>
                <Button className="rounded-2xl gap-2" variant="outline">
                  <Zap className="w-4 h-4" />
                  Auto-Schedule Day
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {todayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  exit={{
                    opacity: 0,
                    x: 100,
                    height: 0,
                    marginBottom: 0,
                    transition: { duration: 0.3 }
                  }}
                  layout
                >
                  <Card className="glass hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-para-area/30 group">
                    <CardContent className="py-4 flex items-center gap-4">
                      <AnimatedCheckbox
                        checked={task.status === 'completed'}
                        onChange={() => handleTaskComplete(task.id)}
                        size="md"
                        color="from-para-area to-para-resource"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Activity Timeline and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ActivityTimeline
            activities={[
              // Mock data for now - will be populated from real API later
              {
                id: '1',
                type: 'capture',
                title: 'New project idea captured',
                category: 'project',
                timestamp: new Date(Date.now() - 5 * 60000)
              },
              {
                id: '2',
                type: 'complete',
                title: 'Completed weekly review',
                category: 'area',
                timestamp: new Date(Date.now() - 2 * 3600000)
              },
              {
                id: '3',
                type: 'create',
                title: 'Created new task list',
                category: 'resource',
                timestamp: new Date(Date.now() - 24 * 3600000)
              }
            ]}
            maxItems={5}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <QuickActionsGrid />
        </motion.div>
      </div>

      {/* Gmail Inbox Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GmailInboxWidget
          onEmailConvert={(email) => {
            setSelectedEmail(email)
            setEmailModalOpen(true)
          }}
          maxEmails={5}
        />
      </motion.div>

      {/* Weekly Review Prompt */}
      {latestReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-l-4 border-para-project group hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-resource flex items-center justify-center"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-heading font-semibold">Last Weekly Review</h3>
                  <p className="text-sm text-muted-foreground font-normal">Your insights and progress</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">{latestReview.summary}</p>
              <div className="flex gap-3">
                <Button className="rounded-2xl gap-2" variant="outline">
                  <Brain className="w-4 h-4" />
                  View Full Review →
                </Button>
                <Button className="rounded-2xl gap-2" variant="default">
                  <Sparkles className="w-4 h-4" />
                  Start New Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Success Confetti for task completion */}
      <SuccessConfetti show={showConfetti} />

      {/* Email to Task Modal */}
      <EmailToTaskModal
        email={selectedEmail}
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false)
          setSelectedEmail(null)
        }}
        onSuccess={() => {
          loadDashboardData()
        }}
      />
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

function getAIInsight(stats: any): string {
  const { activeProjects, todayTasks, completedThisWeek, upcomingDeadlines } = stats

  if (todayTasks === 0 && activeProjects === 0) {
    return "You're all caught up! Great time to start something new."
  }

  if (upcomingDeadlines > 5) {
    return `You have ${upcomingDeadlines} deadlines coming up. Let's prioritize!`
  }

  if (completedThisWeek > 10) {
    return `Incredible! You've completed ${completedThisWeek} tasks this week. Keep the momentum going!`
  }

  if (todayTasks > 0) {
    return `You have ${todayTasks} task${todayTasks > 1 ? 's' : ''} on your plate today. You've got this!`
  }

  return `${activeProjects} active project${activeProjects !== 1 ? 's' : ''} and smooth sailing ahead.`
}
