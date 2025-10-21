'use client'

import { useEffect, useState } from 'react'
import { paraAPI } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PARACard } from '@/components/para/PARACard'
import type { PARAItem } from '@/types'
import { Layers, Search, Plus, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AreasPage() {
  const [areas, setAreas] = useState<PARAItem[]>([])
  const [filteredAreas, setFilteredAreas] = useState<PARAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_hold'>('all')

  useEffect(() => {
    loadAreas()
  }, [])

  useEffect(() => {
    filterAreas()
  }, [areas, searchQuery, statusFilter])

  async function loadAreas() {
    try {
      const data = await paraAPI.getItems('area')
      setAreas(data)
    } catch (error) {
      console.error('Failed to load areas:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterAreas() {
    let filtered = areas

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
      )
    }

    setFilteredAreas(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <Layers className="w-16 h-16 text-para-area mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading areas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-para-area/10 flex items-center justify-center">
            <Layers className="w-6 h-6 text-para-area" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Areas</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Ongoing responsibilities to maintain over time
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-2xl bg-white/50 dark:bg-white/5"
          />
        </div>

        <Button className="rounded-2xl gap-2">
          <Plus className="w-4 h-4" />
          New Area
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {(['all', 'active', 'on_hold'] as const).map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              className={`cursor-pointer rounded-full transition-all ${
                statusFilter === status
                  ? 'bg-para-area text-white hover:bg-para-area/90'
                  : 'hover:bg-para-area/10'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          ))}
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredAreas.length} {filteredAreas.length === 1 ? 'area' : 'areas'}
        </div>
      </div>

      {/* Areas Grid */}
      {filteredAreas.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-para-area to-para-area-light flex items-center justify-center">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No areas match your filters'
                : 'No areas yet'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first area of responsibility'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Area
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map((area) => (
            <PARACard key={area.id} item={area} />
          ))}
        </div>
      )}
    </div>
  )
}
