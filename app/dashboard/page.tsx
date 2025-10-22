'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { paraAPI, tasksAPI, reviewAPI, insightsAPI } from '@/lib/api'
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
import { Sparkles, TrendingUp, Clock, Target, Brain, Zap, Calendar, CheckSquare } from 'lucide-react'

export default function HomePage() {
  const [projects, setProjects] = useState<PARAItem[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [latestReview, setLatestReview] = useState<WeeklyReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [topInsight, setTopInsight] = useState<any>(null)
  const [aiSuggestion, setAISuggestion] = useState<string>('')
  const [aiPrioritizedTasks, setAIPrioritizedTasks] = useState<Task[]>([])
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
      const [projectsData, tasksData, reviewData, insightsData] = await Promise.all([
        paraAPI.getItems('project'),
        tasksAPI.getTasks(),
        reviewAPI.getReviews(),
        insightsAPI.getPatterns().catch(() => ({ insights: [] })) // Optional: don't fail if insights unavailable
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

      // Set top insight from AI
      if (insightsData.insights && insightsData.insights.length > 0) {
        const highImpact = insightsData.insights.find((i: any) => i.impact === 'high')
        setTopInsight(highImpact || insightsData.insights[0])
      }

      // Generate context-aware AI suggestion based on time of day
      setAISuggestion(getContextualSuggestion(todaysTasks.length, completedThisWeek, upcoming, tasksData))

      // AI-prioritize tasks for "Work On This Now" section
      const prioritized = prioritizeTasksWithAI(tasksData, todaysTasks)
      setAIPrioritizedTasks(prioritized.slice(0, 3)) // Top 3 tasks
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

        {/* Morning Briefing - AI-Powered Proactive Insights */}
        {(topInsight || aiSuggestion) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <Card className="border-2 border-para-project/30 bg-gradient-to-br from-para-project/5 via-para-area/5 to-transparent shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(139, 92, 246, 0.4)',
                        '0 0 0 10px rgba(139, 92, 246, 0)',
                        '0 0 0 0 rgba(139, 92, 246, 0)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-heading font-bold flex items-center gap-2">
                      {getGreeting() === 'morning' && '☀️ Morning Briefing'}
                      {getGreeting() === 'afternoon' && '🌤️ Afternoon Check-In'}
                      {getGreeting() === 'evening' && '🌙 Evening Wind-Down'}
                    </h3>
                    <p className="text-xs text-muted-foreground">AI-powered productivity insights</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Top AI Insight from Backend */}
                {topInsight && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-para-project/10 to-para-area/10 border border-para-project/20"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-para-project flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{topInsight.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            topInsight.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            topInsight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {topInsight.impact.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{topInsight.description}</p>
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-para-area/5 border border-para-area/20">
                          <Target className="w-4 h-4 text-para-area flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-para-area">{topInsight.action}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Contextual AI Suggestion */}
                {aiSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-para-area/5 to-para-resource/5 border border-para-area/20"
                  >
                    <Sparkles className="w-5 h-5 text-para-area flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Work On This Now - AI Prioritized Tasks */}
        {aiPrioritizedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card data-tour="work-on-now" className="border-2 border-para-area/30 bg-gradient-to-br from-para-area/5 via-para-resource/5 to-transparent shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">Work On This Now</h3>
                      <p className="text-xs text-muted-foreground">AI-prioritized based on urgency, energy, and time</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiPrioritizedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-white/50 to-white/30 dark:from-white/5 dark:to-white/3 border border-para-area/20 hover:border-para-area/40 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-para-area to-para-resource text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground group-hover:text-para-area transition-colors">
                            {task.title}
                          </h4>
                          {task.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              task.priority === 'high' || task.priority === 'urgent'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {task.description || getAIReasoning(task, index)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.estimated_duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>{task.estimated_duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleTaskComplete(task.id)}
                        size="sm"
                        variant="ghost"
                        className="rounded-xl hover:bg-para-area/10 group-hover:scale-110 transition-transform"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
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

function getContextualSuggestion(todayTasksCount: number, completedThisWeek: number, upcoming: number, allTasks: Task[]): string {
  const hour = new Date().getHours()
  const greeting = getGreeting()

  // Morning suggestions (5am - 12pm)
  if (hour >= 5 && hour < 12) {
    if (todayTasksCount === 0) {
      return "Start your day strong! Review your upcoming tasks and schedule the most important ones for today."
    }
    if (todayTasksCount > 5) {
      return "Your morning looks packed. Consider time-blocking 2-3 hours for deep work on your highest priority task."
    }
    // Find highest priority task
    const highPriorityTask = allTasks.find((t: Task) =>
      t.status !== 'completed' &&
      (t.priority === 'high' || t.priority === 'urgent')
    )
    if (highPriorityTask) {
      return `Your energy is highest now. Tackle "${highPriorityTask.title}" while you're fresh.`
    }
    return "Your most productive hours are now. Focus on your most challenging task first."
  }

  // Afternoon suggestions (12pm - 6pm)
  if (hour >= 12 && hour < 18) {
    if (completedThisWeek >= 5) {
      return "Strong progress this week! Take a 10-minute break before diving into your next task."
    }
    if (todayTasksCount > 3) {
      return "Afternoon energy dip? This is the perfect time for quick wins and lighter tasks."
    }
    return "Mid-day checkpoint: Review your morning progress and adjust your afternoon priorities."
  }

  // Evening suggestions (6pm - midnight)
  if (hour >= 18) {
    if (upcoming > 3) {
      return `Wind down by planning tomorrow. You have ${upcoming} tasks due soon - schedule the top 3 for tomorrow morning.`
    }
    if (completedThisWeek < 3) {
      return "Struggling this week? Try breaking down tomorrow's tasks into smaller, 25-minute chunks."
    }
    return "Great work today! Do a quick 5-minute review: what worked well? What will you improve tomorrow?"
  }

  // Default fallback
  return "Stay focused on your top priorities. You're making progress!"
}

function prioritizeTasksWithAI(allTasks: Task[], todayTasks: Task[]): Task[] {
  const hour = new Date().getHours()
  const now = new Date()

  // Filter incomplete tasks
  const incompleteTasks = allTasks.filter((t: Task) => t.status !== 'completed')

  // Score each task based on multiple factors
  const scoredTasks = incompleteTasks.map((task: Task) => {
    let score = 0

    // Priority weight (highest impact)
    if (task.priority === 'urgent') score += 100
    else if (task.priority === 'high') score += 75
    else if (task.priority === 'medium') score += 50
    else if (task.priority === 'low') score += 25

    // Due date urgency
    if (task.due_date) {
      const dueDate = new Date(task.due_date)
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDue < 0) score += 150 // Overdue - critical!
      else if (daysUntilDue === 0) score += 120 // Due today
      else if (daysUntilDue === 1) score += 90 // Due tomorrow
      else if (daysUntilDue <= 3) score += 60 // Due this week
      else if (daysUntilDue <= 7) score += 30 // Due next week
    }

    // Time of day energy matching
    if (task.estimated_duration_minutes) {
      const duration = task.estimated_duration_minutes

      // Morning (5am-12pm): Prioritize longer, harder tasks
      if (hour >= 5 && hour < 12) {
        if (duration > 60) score += 40 // Long tasks in morning
        else if (duration > 30) score += 20
      }
      // Afternoon (12pm-6pm): Prioritize medium tasks
      else if (hour >= 12 && hour < 18) {
        if (duration >= 20 && duration <= 45) score += 40 // Quick wins
        else if (duration < 20) score += 30
      }
      // Evening (6pm+): Prioritize short, easy tasks
      else if (hour >= 18) {
        if (duration <= 20) score += 40 // Short tasks
        else if (duration <= 30) score += 20
      }
    }

    // Boost tasks scheduled for today
    if (todayTasks.some(t => t.id === task.id)) {
      score += 50
    }

    return { task, score }
  })

  // Sort by score descending
  return scoredTasks
    .sort((a, b) => b.score - a.score)
    .map(item => item.task)
}

function getAIReasoning(task: Task, rank: number): string {
  const now = new Date()
  const hour = now.getHours()

  // Check if overdue
  if (task.due_date) {
    const dueDate = new Date(task.due_date)
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      return `⚠️ Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}. Tackle this ASAP.`
    }
    if (daysUntilDue === 0) {
      return `🔥 Due today! ${task.priority === 'high' ? 'High priority - do this first.' : 'Make this a priority.'}`
    }
    if (daysUntilDue === 1) {
      return `⏰ Due tomorrow. Get ahead by finishing it today.`
    }
  }

  // Time-based reasoning
  if (hour >= 5 && hour < 12) {
    if (rank === 0) return "☀️ Your energy is peak now. Perfect time for this challenging task."
    if (task.estimated_duration_minutes && task.estimated_duration_minutes > 45) {
      return "🧠 Long task best tackled while you're fresh in the morning."
    }
  }

  if (hour >= 12 && hour < 18) {
    if (task.estimated_duration_minutes && task.estimated_duration_minutes <= 30) {
      return "⚡ Quick win perfect for afternoon energy levels."
    }
  }

  if (hour >= 18) {
    if (task.estimated_duration_minutes && task.estimated_duration_minutes <= 20) {
      return "🌙 Light task ideal for winding down your day productively."
    }
  }

  // Priority-based reasoning
  if (task.priority === 'high' || task.priority === 'urgent') {
    return `🎯 High priority task. ${rank === 0 ? 'Start here.' : 'Move this up your list.'}`
  }

  // Default
  return "AI recommends focusing on this based on your current workload and timing."
}
