'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Link as LinkIcon, X, Plus, FolderKanban, Layers, BookOpen, Archive as ArchiveIcon } from 'lucide-react'
import type { PARARelationship, PARAItem } from '@/types'

interface RelationshipsPanelProps {
  itemId: string
  relationships: PARARelationship[]
  onRelationshipsChange: () => void
}

const typeIcons = {
  project: FolderKanban,
  area: Layers,
  resource: BookOpen,
  archive: ArchiveIcon
}

const typeGradients = {
  project: 'from-para-project to-para-area',
  area: 'from-para-area to-para-resource',
  resource: 'from-para-resource to-para-archive',
  archive: 'from-para-archive to-para-project'
}

export function RelationshipsPanel({ itemId, relationships, onRelationshipsChange }: RelationshipsPanelProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      await paraAPI.deleteRelationship(itemId, relationshipId)
      onRelationshipsChange()
      showToast.success('Link removed')
    } catch (error) {
      showToast.error('Failed to remove link')
    }
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Related Items
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            Link Item
          </Button>
        )}
      </div>

      {/* Add Relationship UI - Placeholder */}
      {isAdding && (
        <Card className="glass p-4 mb-4 border-dashed border-2">
          <p className="text-sm text-muted-foreground mb-2">
            Item linking UI coming soon
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            You'll be able to search and link any PARA item
          </p>
          <Button
            onClick={() => setIsAdding(false)}
            variant="ghost"
            size="sm"
            className="rounded-xl"
          >
            Cancel
          </Button>
        </Card>
      )}

      {/* Relationships List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {relationships.map((relationship) => {
            if (!relationship.related_item) return null

            const item = relationship.related_item as PARAItem
            const Icon = typeIcons[item.para_type] || FolderKanban
            const gradient = typeGradients[item.para_type] || typeGradients.project

            return (
              <motion.div
                key={relationship.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
              >
                <div className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/50 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex gap-2 mt-0.5">
                      <Badge variant="outline" className="rounded-full text-xs">
                        {item.para_type}
                      </Badge>
                      {relationship.relationship_type !== 'related' && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          {relationship.relationship_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteRelationship(relationship.id)}
                    variant="ghost"
                    size="icon"
                    className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {relationships.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <LinkIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No related items</p>
          <p className="text-xs text-muted-foreground mt-1">
            Link projects, areas, or resources together
          </p>
        </div>
      )}
    </Card>
  )
}
