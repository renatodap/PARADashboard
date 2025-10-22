'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { reviewAPI, tasksAPI, paraAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'
import type { WeeklyReview } from '@/types'
import { Sparkles, FileText, TrendingUp, Calendar, CheckCircle2, Target, Archive, Edit, Plus, X, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ReviewPage() {
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completedRollovers, setCompletedRollovers] = useState<Set<string>>(new Set())
  const [acceptedProposals, setAcceptedProposals] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    try {
      const data = await reviewAPI.getReviews()
      setReviews(data)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateReview() {
    setGenerating(true)
    try {
      await reviewAPI.generate()
      await loadReviews()
      showToast.success('Weekly review generated!')
    } catch (error) {
      console.error('Failed to generate review:', error)
      showToast.error('Failed to generate review')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCompleteRollover(taskId: string) {
    try {
      await tasksAPI.updateTask(taskId, { status: 'completed', completed_at: new Date().toISOString() })
      setCompletedRollovers(prev => new Set([...prev, taskId]))
      showToast.success('Task completed!')
    } catch (error) {
      console.error('Failed to complete task:', error)
      showToast.error('Failed to complete task')
    }
  }

  async function handleRescheduleTask(taskId: string) {
    try {
      // Reschedule to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      await tasksAPI.updateTask(taskId, { due_date: tomorrow.toISOString() })
      showToast.success('Task rescheduled to tomorrow!')
    } catch (error) {
      console.error('Failed to reschedule task:', error)
      showToast.error('Failed to reschedule task')
    }
  }

  async function handleCreateTaskFromProposal(outcome: string, index: number) {
    try {
      await tasksAPI.createTask({
        title: outcome,
        status: 'pending',
        priority: 'medium'
      })
      setAcceptedProposals(prev => new Set([...prev, index]))
      showToast.success('Task created for next week!')
    } catch (error) {
      console.error('Failed to create task:', error)
      showToast.error('Failed to create task')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <FileText className="w-16 h-16 text-para-project mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    )
  }

  const latestReview = reviews[0]

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-resource/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-para-resource" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Weekly Review</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          AI-powered insights into your productivity and progress
        </p>
      </div>

      {/* Generate Review CTA */}
      <Card className="glass border-l-4 border-para-project">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">Generate Weekly Review</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get AI insights on your wins, progress, and what to focus on next week
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateReview}
              disabled={generating}
              className="rounded-2xl"
            >
              {generating ? 'Generating...' : 'Generate Review'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Review */}
      {latestReview ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold">
              Week of {formatDate(latestReview.week_start_date)}
            </h2>
            <div className="text-sm text-muted-foreground">
              Generated {formatDate(latestReview.created_at)}
            </div>
          </div>

          {/* Summary */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-para-project" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {latestReview.summary}
              </p>
            </CardContent>
          </Card>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wins */}
            <Card className="glass hover:shadow-resource transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  Key Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestReview.insights?.wins?.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{win}</span>
                    </li>
                  )) || (
                    <li className="text-sm text-muted-foreground">No wins recorded</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Rollovers */}
            <Card className="glass hover:shadow-area transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  Rollovers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {latestReview.insights?.rollovers?.map((rollover, i) => {
                    const isCompleted = rollover.task_id ? completedRollovers.has(rollover.task_id) : false
                    return (
                      <motion.li
                        key={i}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isCompleted ? 0.5 : 1 }}
                        className="group"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 ${
                            isCompleted ? 'bg-blue-600 border-blue-600' : 'border-blue-600'
                          }`}>
                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm block ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {rollover.task_title}
                            </span>
                            {!isCompleted && rollover.task_id && (
                              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => handleCompleteRollover(rollover.task_id!)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs rounded-lg px-2"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                                <Button
                                  onClick={() => handleRescheduleTask(rollover.task_id!)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs rounded-lg px-2"
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Tomorrow
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.li>
                    )
                  }) || (
                    <li className="text-sm text-muted-foreground">No rollovers</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Next Week Focus */}
            <Card className="glass hover:shadow-project transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  Next Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {latestReview.insights?.next_week_proposals?.map((proposal, i) => {
                    const isAccepted = acceptedProposals.has(i)
                    return (
                      <motion.li
                        key={i}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isAccepted ? 0.5 : 1 }}
                        className="group"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${
                            isAccepted ? 'bg-green-600' : 'bg-purple-600'
                          }`}>
                            {isAccepted && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm block ${isAccepted ? 'line-through text-muted-foreground' : ''}`}>
                              {proposal.outcome}
                            </span>
                            {!isAccepted && (
                              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => handleCreateTaskFromProposal(proposal.outcome, i)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs rounded-lg px-2"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Create Task
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.li>
                    )
                  }) || (
                    <li className="text-sm text-muted-foreground">No focus areas</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {latestReview.insights?.insights && latestReview.insights.insights.length > 0 && (
            <Card className="glass border-l-4 border-para-project">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-para-project" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestReview.insights.insights.map((insight, i) => (
                    <li key={i} className="text-muted-foreground leading-relaxed">
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-resource to-para-resource-light flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              No weekly reviews yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Generate your first weekly review to get AI-powered insights
            </p>
            <Button onClick={handleGenerateReview} disabled={generating} className="rounded-2xl">
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Your First Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Past Reviews */}
      {reviews.length > 1 && (
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-6">Past Reviews</h2>
          <div className="space-y-4">
            {reviews.slice(1).map((review) => (
              <Card key={review.id} className="glass hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Week of {formatDate(review.week_start_date)}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
