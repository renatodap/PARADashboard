'use client'

import { useEffect, useState } from 'react'
import { paraAPI } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PARACard } from '@/components/para/PARACard'
import type { PARAItem } from '@/types'
import { BookOpen, Search, Plus, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ResourcesPage() {
  const [resources, setResources] = useState<PARAItem[]>([])
  const [filteredResources, setFilteredResources] = useState<PARAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery])

  async function loadResources() {
    try {
      const data = await paraAPI.getItems('resource')
      setResources(data)
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterResources() {
    let filtered = resources

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <BookOpen className="w-16 h-16 text-para-resource mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-resource/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-para-resource" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Resources</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Topics of interest and reference materials
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-2xl bg-white/50 dark:bg-white/5"
          />
        </div>

        <Button className="rounded-2xl gap-2">
          <Plus className="w-4 h-4" />
          New Resource
        </Button>
      </div>

      {/* Count */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-resource to-para-resource-light flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No resources match your search' : 'No resources yet'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start building your reference library'}
            </p>
            {!searchQuery && (
              <Button className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Resource
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <PARACard key={resource.id} item={resource} />
          ))}
        </div>
      )}
    </div>
  )
}
