'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Calendar, CheckCircle2 } from 'lucide-react'
import type { PARAItem } from '@/types'
import { formatDate, getPARATypeColor, getPARAShadowClass, getPARABorderClass, cn } from '@/lib/utils'

interface PARACardProps {
  item: PARAItem
  onEdit?: (item: PARAItem) => void
  onDelete?: (id: string) => void
}

export function PARACard({ item, onEdit, onDelete }: PARACardProps) {
  return (
    <Card className={cn(
      "cursor-pointer transition-all duration-300 ease-smooth hover:-translate-y-1",
      getPARAShadowClass(item.para_type),
      getPARABorderClass(item.para_type)
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge className={cn("rounded-full", getPARATypeColor(item.para_type))}>
              {item.para_type.toUpperCase()}
            </Badge>
            <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {item.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(item.due_date)}
            </div>
          )}
          {item.status === 'completed' && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
