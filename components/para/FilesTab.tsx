'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { File, FileText, Image, Trash2, Download, ExternalLink } from 'lucide-react'
import type { PARAFile } from '@/types'

interface FilesTabProps {
  itemId: string
  files: PARAFile[]
  onFilesChange: () => void
}

const fileIcons: Record<string, any> = {
  'image/': Image,
  'application/pdf': FileText,
  default: File
}

const getFileIcon = (fileType: string) => {
  for (const [key, Icon] of Object.entries(fileIcons)) {
    if (fileType.startsWith(key)) return Icon
  }
  return fileIcons.default
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function FilesTab({ itemId, files, onFilesChange }: FilesTabProps) {
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return

    try {
      await paraAPI.deleteFile(itemId, fileId)
      onFilesChange()
      showToast.success('File deleted')
    } catch (error) {
      showToast.error('Failed to delete file')
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload UI - Placeholder for now */}
      <Card className="glass p-6 border-dashed border-2 text-center">
        <File className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground mb-2">
          File upload coming soon
        </p>
        <p className="text-xs text-muted-foreground">
          Files will be stored in Supabase Storage
        </p>
      </Card>

      {/* Files List */}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {files.map((file) => {
            const Icon = getFileIcon(file.file_type)
            const isImage = file.file_type.startsWith('image/')

            return (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="glass p-4 hover:bg-white/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {isImage && file.file_url ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={file.file_url}
                          alt={file.file_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-para-project/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-para-project" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {file.file_name}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="rounded-full text-xs">
                          {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {formatFileSize(file.file_size)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {file.file_url && (
                        <Button
                          onClick={() => window.open(file.file_url, '_blank')}
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-muted-foreground hover:text-para-project"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteFile(file.id, file.file_name)}
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-12">
          <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No files attached</p>
          <p className="text-sm text-muted-foreground mt-1">
            File upload feature will be added soon
          </p>
        </div>
      )}
    </div>
  )
}
