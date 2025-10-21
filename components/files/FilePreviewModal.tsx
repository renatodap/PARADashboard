'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Download, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface File {
  id: string
  file_name: string
  file_type: string
  file_url: string
  extracted_text?: string
  ocr_text?: string
  page_count?: number
  metadata?: {
    favicon?: string
    site_name?: string
    author?: string
  }
}

interface FilePreviewModalProps {
  file: File | null
  open: boolean
  onClose: () => void
}

export function FilePreviewModal({ file, open, onClose }: FilePreviewModalProps) {
  if (!file) return null

  const handleDownload = () => {
    window.open(file.file_url, '_blank')
  }

  const renderPreview = () => {
    switch (file.file_type) {
      case 'pdf':
        return (
          <div className="w-full h-full flex flex-col">
            <iframe
              src={file.file_url}
              className="w-full flex-1 rounded-lg border"
              title={file.file_name}
            />
            {file.extracted_text && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-60 overflow-auto">
                <h4 className="font-semibold mb-2 text-sm">Extracted Text</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {file.extracted_text.substring(0, 1000)}
                  {file.extracted_text.length > 1000 && '...'}
                </p>
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={file.file_url}
              alt={file.file_name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
            {file.ocr_text && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-40 overflow-auto w-full">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <span className="text-xs bg-para-area/10 text-para-area px-2 py-1 rounded">OCR</span>
                  Detected Text
                </h4>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {file.ocr_text.substring(0, 500)}
                  {file.ocr_text.length > 500 && '...'}
                </p>
              </div>
            )}
          </div>
        )

      case 'link':
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
              {file.metadata?.favicon && (
                <img
                  src={file.metadata.favicon}
                  alt="Site favicon"
                  className="w-8 h-8 object-contain"
                />
              )}
              <div className="flex-1">
                {file.metadata?.site_name && (
                  <p className="font-semibold text-sm">{file.metadata.site_name}</p>
                )}
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-para-resource hover:underline flex items-center gap-1"
                >
                  {file.file_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <iframe
              src={file.file_url}
              className="w-full flex-1 rounded-lg border"
              title={file.file_name}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />

            {file.extracted_text && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-60 overflow-auto">
                <h4 className="font-semibold mb-2 text-sm">Archived Content</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {file.extracted_text.substring(0, 1000)}
                  {file.extracted_text.length > 1000 && '...'}
                </p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
              <Button onClick={handleDownload} className="rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center justify-between">
            <span className="truncate mr-4">{file.file_name}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="rounded-xl"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
