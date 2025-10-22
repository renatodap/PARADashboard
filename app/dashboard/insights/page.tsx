'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, AlertTriangle, Zap, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { insightsAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { motion } from 'framer-motion'

interface Insight {
  type: string
  title: string
  description: string
  action: string
  impact: 'high' | 'medium' | 'low'
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    try {
      setLoading(true)
      const data = await insightsAPI.getPatterns()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Failed to load insights:', error)
      showToast.error('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadInsights()
    setRefreshing(false)
    showToast.success('Insights refreshed!')
  }

  function getImpactColor(impact: string) {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'productivity_pattern': return TrendingUp
      case 'blocker': return AlertTriangle
      case 'suggestion': return Zap
      default: return Brain
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-para-project mx-auto mb-4" />
          <p className="text-muted-foreground">AI is analyzing your productivity patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-para-project" />
            <h1 className="text-3xl font-heading font-bold">AI Insights</h1>
          </div>
          <p className="text-muted-foreground">
            Productivity patterns and personalized recommendations
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing...</>
          ) : (
            <>Refresh Insights</>
          )}
        </Button>
      </div>

      {/* No insights state */}
      {insights.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Not enough data yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Complete a few more tasks this week and AI will start detecting productivity patterns!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {insights.map((insight, index) => {
          const Icon = getTypeIcon(insight.type)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-para-project">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-para-project/10 to-para-area/10">
                        <Icon className="w-5 h-5 text-para-project" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${getImpactColor(insight.impact)}`}>
                          {insight.impact === 'high' && <Zap className="w-3 h-3" />}
                          {insight.impact === 'medium' && <Clock className="w-3 h-3" />}
                          {insight.impact === 'low' && <CheckCircle className="w-3 h-3" />}
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {insight.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-para-area/5 to-para-resource/5 border border-para-area/20">
                    <p className="text-sm font-medium text-para-area mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Suggested Action:
                    </p>
                    <p className="text-sm">{insight.action}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Stats Summary */}
      {insights.length > 0 && (
        <Card className="bg-gradient-to-br from-para-project/5 via-para-area/5 to-para-resource/5">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-para-project mb-1">
                  {insights.filter(i => i.impact === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Impact</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-para-area mb-1">
                  {insights.filter(i => i.type === 'productivity_pattern').length}
                </div>
                <div className="text-sm text-muted-foreground">Patterns Found</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-para-resource mb-1">
                  {insights.filter(i => i.type === 'blocker').length}
                </div>
                <div className="text-sm text-muted-foreground">Blockers Detected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-para-area/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-para-area" />
            How AI Insights Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong className="text-para-project">Productivity Patterns:</strong> AI analyzes when you complete tasks to find your peak performance times.
          </p>
          <p>
            <strong className="text-para-area">Blockers:</strong> Detects stale projects and tasks that keep rolling over, suggesting ways to unblock progress.
          </p>
          <p>
            <strong className="text-para-resource">Recommendations:</strong> Based on 30 days of task history, AI provides personalized productivity tips.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
