"use client"

import { useState, useEffect } from "react"
import { FileText, Image as ImageIcon, Download, Trash2, Search, Filter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import FileUpload from "@/components/files/FileUpload"
import { FilePreviewModal } from "@/components/files/FilePreviewModal"
import { filesAPI } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface File {
  id: string
  file_name: string
  file_type: string
  file_size_bytes: number
  file_url: string
  extracted_text?: string
  ocr_text?: string
  page_count?: number
  processing_status: string
  uploaded_at: string
  metadata?: {
    favicon?: string
    site_name?: string
    author?: string
    word_count?: number
  }
  para_items?: {
    id: string
    title: string
    para_type: string
  }
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [filterType])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterType) params.file_type = filterType

      const response = await filesAPI.getFiles(params)
      setFiles(response.files)
    } catch (error: any) {
      showToast.error('Failed to load files')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      await filesAPI.deleteFile(fileId)
      showToast.success('File deleted successfully')
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error: any) {
      showToast.error('Failed to delete file')
    }
  }

  const handleDownload = (file: File) => {
    window.open(file.file_url, '_blank')
  }

  const handlePreview = (file: File) => {
    setPreviewFile(file)
    setPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setPreviewOpen(false)
    setTimeout(() => setPreviewFile(null), 200)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPARAColor = (type: string) => {
    const colors: any = {
      project: 'text-para-project',
      area: 'text-para-area',
      resource: 'text-para-resource',
      archive: 'text-para-archive',
    }
    return colors[type] || 'text-slate-500'
  }

  const filteredFiles = files.filter(file =>
    searchQuery === "" ||
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.para_items?.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Files</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload and manage your knowledge base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Items</div>
          <div className="text-3xl font-bold">{files.length}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">PDFs</div>
          <div className="text-3xl font-bold text-para-project">
            {files.filter(f => f.file_type === 'pdf').length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Images</div>
          <div className="text-3xl font-bold text-para-area">
            {files.filter(f => f.file_type === 'image').length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Links</div>
          <div className="text-3xl font-bold text-para-resource">
            {files.filter(f => f.file_type === 'link').length}
          </div>
        </Card>
      </div>

      {/* Upload Section */}
      {showUpload ? (
        <div className="space-y-4">
          <FileUpload onUploadComplete={(file) => {
            loadFiles()
            setShowUpload(false)
          }} />
          <Button variant="outline" onClick={() => setShowUpload(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="lg" onClick={() => setShowUpload(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Upload New File
        </Button>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700
                     focus:border-para-project focus:ring-4 focus:ring-para-project/20
                     transition-all duration-300"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={filterType === null ? "default" : "outline"}
            onClick={() => setFilterType(null)}
            className="whitespace-nowrap"
          >
            All
          </Button>
          <Button
            variant={filterType === 'pdf' ? "default" : "outline"}
            onClick={() => setFilterType('pdf')}
            className="whitespace-nowrap"
          >
            PDFs
          </Button>
          <Button
            variant={filterType === 'image' ? "default" : "outline"}
            onClick={() => setFilterType('image')}
            className="whitespace-nowrap"
          >
            Images
          </Button>
          <Button
            variant={filterType === 'link' ? "default" : "outline"}
            onClick={() => setFilterType('link')}
            className="whitespace-nowrap"
          >
            Links
          </Button>
        </div>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-para-project border-t-transparent" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No files yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Upload your first file to get started
          </p>
          <Button onClick={() => setShowUpload(true)}>
            Upload File
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  {/* File Icon / Thumbnail */}
                  <div className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0
                    ${file.file_type === 'pdf' ? 'bg-para-project/10' :
                      file.file_type === 'image' ? 'bg-para-area/10' :
                      file.file_type === 'link' ? 'bg-para-resource/10' : 'bg-slate-100 dark:bg-slate-800'}
                  `}>
                    {file.file_type === 'pdf' ? (
                      <FileText className="w-7 h-7 text-para-project" />
                    ) : file.file_type === 'image' ? (
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = '<svg class="w-7 h-7 text-para-area" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                        }}
                      />
                    ) : file.file_type === 'link' && file.metadata?.favicon ? (
                      <img
                        src={file.metadata.favicon}
                        alt="Favicon"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          // Fallback to link icon if favicon fails to load
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = '<svg class="w-7 h-7 text-para-resource" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>'
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {file.para_items?.title || file.file_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-slate-600 dark:text-slate-400">
                      {file.file_type !== 'link' && <span>{formatFileSize(file.file_size_bytes)}</span>}
                      {file.page_count && (
                        <span>{file.page_count} pages</span>
                      )}
                      {file.file_type === 'link' && file.metadata?.site_name && (
                        <span className="text-para-resource font-medium">{file.metadata.site_name}</span>
                      )}
                      {file.file_type === 'link' && file.metadata?.word_count && (
                        <span>{file.metadata.word_count} words</span>
                      )}
                      <span className="hidden sm:inline">{formatDate(file.uploaded_at)}</span>
                      <span className="sm:hidden">{new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>

                      {file.para_items && (
                        <span className={`font-medium ${getPARAColor(file.para_items.para_type)}`}>
                          {file.para_items.para_type}
                        </span>
                      )}

                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${file.processing_status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : file.processing_status === 'processing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : file.processing_status === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }
                      `}>
                        {file.processing_status}
                      </span>
                    </div>

                    {(file.extracted_text || file.ocr_text) && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {file.file_type === 'image' && file.ocr_text && (
                          <span className="text-xs bg-para-area/10 text-para-area px-2 py-1 rounded mr-2">OCR</span>
                        )}
                        {(file.extracted_text || file.ocr_text || '').substring(0, 200)}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePreview(file)}
                    title="Preview"
                    className="flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(file)}
                    title="Download"
                    className="flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                    title="Delete"
                    className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        open={previewOpen}
        onClose={handleClosePreview}
      />
    </div>
  )
}
