'use client'

import { useEffect, useState } from 'react'
import { paraAPI } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PARACard } from '@/components/para/PARACard'
import type { PARAItem } from '@/types'
import { Sparkles, Search, Plus, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<PARAItem[]>([])
  const [filteredProjects, setFilteredProjects] = useState<PARAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all')
  const [classifying, setClassifying] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, statusFilter])

  async function loadProjects() {
    try {
      const data = await paraAPI.getItems('project')
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterProjects() {
    let filtered = projects

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    setFilteredProjects(filtered)
  }

  async function handleAIClassify() {
    setClassifying(true)
    try {
      // TODO: Implement AI classification
      // This would call an API endpoint that uses the classifier agent
      console.log('AI Classify triggered')
      // For now, just reload
      await loadProjects()
    } catch (error) {
      console.error('AI classification failed:', error)
    } finally {
      setClassifying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <Sparkles className="w-16 h-16 text-para-project mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-project/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-para-project" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Projects</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Active endeavors with clear goals and deadlines
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-2xl bg-white/50 dark:bg-white/5"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-2xl gap-2"
            onClick={handleAIClassify}
            disabled={classifying}
          >
            <Sparkles className="w-4 h-4" />
            {classifying ? 'Classifying...' : 'AI Classify'}
          </Button>
          <Button className="rounded-2xl gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'on_hold'] as const).map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              className={`cursor-pointer rounded-full transition-all ${
                statusFilter === status
                  ? 'bg-para-project text-white hover:bg-para-project/90'
                  : 'hover:bg-para-project/10'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          ))}
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-project to-para-project-light flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No projects match your filters'
                : 'No projects yet'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first project'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <PARACard key={project.id} item={project} />
          ))}
        </div>
      )}
    </div>
  )
}
