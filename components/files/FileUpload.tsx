"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { filesAPI } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface FileUploadProps {
  onUploadComplete?: (file: any) => void
}

type UploadMode = 'file' | 'link'

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [mode, setMode] = useState<UploadMode>('file')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToast.error('File type not supported. Please upload PDF or image files.')
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      showToast.error('File too large. Maximum size is 50MB.')
      return
    }

    setSelectedFile(file)
    setUploadedFile(null)

    // Generate image preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress (real progress tracking would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await filesAPI.upload(selectedFile)

      clearInterval(progressInterval)
      setUploadProgress(100)

      showToast.success('File uploaded successfully!')
      setUploadedFile(response.file)

      if (onUploadComplete) {
        onUploadComplete(response.file)
      }

      // Reset after success
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
      }, 2000)

    } catch (error: any) {
      showToast.error(error.message || 'Upload failed')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleArchiveLink = async () => {
    if (!linkUrl.trim()) {
      showToast.error('Please enter a URL')
      return
    }

    // Basic URL validation
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      showToast.error('URL must start with http:// or https://')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await filesAPI.archiveLink(linkUrl)

      clearInterval(progressInterval)
      setUploadProgress(100)

      showToast.success('Link archived successfully!')
      setUploadedFile(response.file)

      if (onUploadComplete) {
        onUploadComplete(response.file)
      }

      // Reset after success
      setTimeout(() => {
        setLinkUrl('')
        setUploadProgress(0)
      }, 2000)

    } catch (error: any) {
      showToast.error(error.message || 'Failed to archive link')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setUploadedFile(null)
    setUploadProgress(0)
    setImagePreview(null)
    setLinkUrl('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Card className="p-8">
      {/* Mode Toggle */}
      {!selectedFile && !linkUrl && !uploadedFile && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'file' ? 'default' : 'outline'}
            onClick={() => setMode('file')}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <Button
            variant={mode === 'link' ? 'default' : 'outline'}
            onClick={() => setMode('link')}
            className="flex-1"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Archive Link
          </Button>
        </div>
      )}

      {/* Link Input */}
      {mode === 'link' && !uploadedFile && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter URL to archive</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700
                       focus:border-para-project focus:ring-4 focus:ring-para-project/20
                       transition-all duration-300"
              disabled={uploading}
            />
          </div>

          {/* Archive Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {uploadProgress < 100 ? 'Archiving...' : 'Processing...'}
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Archive Button */}
          {!uploading && linkUrl && (
            <div className="flex gap-3">
              <Button
                onClick={handleArchiveLink}
                size="lg"
                className="flex-1"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Archive Page
              </Button>

              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Drag and Drop Area (File Mode) */}
      {mode === 'file' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${isDragging
              ? 'border-para-project bg-para-project/10 scale-105'
              : 'border-slate-300 dark:border-slate-700 hover:border-para-project/50'
            }
          `}
        >
          {!selectedFile && !uploadedFile && (
          <>
            <div className="w-20 h-20 rounded-full bg-para-project/10 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-para-project" />
            </div>

            <h3 className="text-2xl font-bold mb-2">
              {isDragging ? 'Drop file here' : 'Upload a File'}
            </h3>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Drag and drop or click to browse
            </p>

            <input
              type="file"
              onChange={handleFileInput}
              accept=".pdf,image/*"
              className="hidden"
              id="file-input"
            />

            <label htmlFor="file-input">
              <Button asChild className="cursor-pointer">
                <span>
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </span>
              </Button>
            </label>

            <p className="text-sm text-slate-500 mt-4">
              Supported: PDF, JPG, PNG, WebP (max 50MB)
            </p>
          </>
        )}

        {/* Selected File Preview */}
        {selectedFile && !uploadedFile && (
          <div className="space-y-6">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-contain"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                    <img src={imagePreview} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <FileText className="w-8 h-8 text-para-project" />
                )}
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(selectedFile.size)}
                    {imagePreview && <span className="ml-2 text-para-area">• Image</span>}
                    {!imagePreview && selectedFile.type === 'application/pdf' && <span className="ml-2 text-para-project">• PDF</span>}
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  size="lg"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </Button>

                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {/* Success State (for both modes) */}
      {uploadedFile && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h3 className="text-2xl font-bold">
            {mode === 'link' ? 'Link Archived!' : 'Upload Successful!'}
          </h3>

          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'link'
              ? 'Your link has been archived and is being processed with AI.'
              : 'Your file has been uploaded and is being processed with AI.'}
          </p>

          {uploadedFile.processing_status === 'completed' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ AI classified as: <strong>{uploadedFile.para_type || 'Resource'}</strong>
              </p>
            </div>
          )}

          <Button onClick={handleCancel} variant="outline">
            {mode === 'link' ? 'Archive Another Link' : 'Upload Another File'}
          </Button>
        </div>
      )}
    </Card>
  )
}
