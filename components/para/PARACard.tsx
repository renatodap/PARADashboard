'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Calendar, CheckCircle2, Sparkles } from 'lucide-react'
import type { PARAItem } from '@/types'
import { formatDate, getPARATypeColor, getPARAShadowClass, getPARABorderClass, cn } from '@/lib/utils'

interface PARACardProps {
  item: PARAItem
  onEdit?: (item: PARAItem) => void
  onDelete?: (id: string) => void
}

const paraTypeGradients = {
  project: 'from-para-project to-para-area',
  area: 'from-para-area to-para-resource',
  resource: 'from-para-resource to-para-archive',
  archive: 'from-para-archive to-para-project'
}

export function PARACard({ item, onEdit, onDelete }: PARACardProps) {
  const gradient = paraTypeGradients[item.para_type as keyof typeof paraTypeGradients] || paraTypeGradients.project

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className={cn(
        "cursor-pointer transition-all duration-300 ease-smooth glass overflow-hidden relative group",
        getPARAShadowClass(item.para_type),
        getPARABorderClass(item.para_type)
      )}>
        {/* Animated gradient background on hover */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
            gradient
          )}
        />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <Badge className={cn("rounded-full", getPARATypeColor(item.para_type))}>
                  {item.para_type.toUpperCase()}
                </Badge>
              </motion.div>
              <CardTitle className="text-lg mt-2 group-hover:text-foreground transition-colors">
                {item.title}
              </CardTitle>
            </div>
            <motion.div whileHover={{ rotate: 90 }}>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          {item.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {item.due_date && (
              <motion.div
                className="flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(item.due_date)}
              </motion.div>
            )}
            {item.status === 'completed' && (
              <motion.div
                className="flex items-center gap-1 text-green-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </motion.div>
            )}
          </div>

          {/* Progress indicator for projects */}
          {item.para_type === 'project' && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className={cn('h-full bg-gradient-to-r', gradient)}
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">60% complete</p>
            </div>
          )}
        </CardContent>

        {/* Corner sparkle on hover */}
        <motion.div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="w-4 h-4 text-para-project" />
        </motion.div>
      </Card>
    </motion.div>
  )
}
