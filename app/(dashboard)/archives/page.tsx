'use client'

import { useEffect, useState } from 'react'
import { paraAPI } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PARACard } from '@/components/para/PARACard'
import type { PARAItem } from '@/types'
import { Archive, Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ArchivesPage() {
  const [archives, setArchives] = useState<PARAItem[]>([])
  const [filteredArchives, setFilteredArchives] = useState<PARAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'project' | 'area' | 'resource'>('all')

  useEffect(() => {
    loadArchives()
  }, [])

  useEffect(() => {
    filterArchives()
  }, [archives, searchQuery, typeFilter])

  async function loadArchives() {
    try {
      const data = await paraAPI.getItems('archive')
      setArchives(data)
    } catch (error) {
      console.error('Failed to load archives:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterArchives() {
    let filtered = archives

    if (typeFilter !== 'all') {
      // Filter by original type (if we track that)
      // For now, show all since archives don't have a type field
      filtered = archives
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
      )
    }

    setFilteredArchives(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <Archive className="w-16 h-16 text-para-archive mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading archives...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-archive/10 flex items-center justify-center">
            <Archive className="w-6 h-6 text-para-archive" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Archives</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Completed or inactive items for reference
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-2xl bg-white/50 dark:bg-white/5"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {(['all', 'project', 'area', 'resource'] as const).map((type) => (
            <Badge
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              className={`cursor-pointer rounded-full transition-all ${
                typeFilter === type
                  ? 'bg-para-archive text-white hover:bg-para-archive/90'
                  : 'hover:bg-para-archive/10'
              }`}
              onClick={() => setTypeFilter(type)}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          ))}
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredArchives.length} {filteredArchives.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Archives Grid */}
      {filteredArchives.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-archive to-para-archive-light flex items-center justify-center">
              <Archive className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {searchQuery || typeFilter !== 'all'
                ? 'No archived items match your filters'
                : 'No archived items yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Completed projects and inactive items will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchives.map((archive) => (
            <PARACard key={archive.id} item={archive} />
          ))}
        </div>
      )}
    </div>
  )
}
