'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, Eye, X } from 'lucide-react'

interface DocumentUploadProps {
  tripId: string
  userId: string
  documentType: string
  existingUrl?: string | null
  onUploadComplete: (url: string) => void
  onDelete?: () => void
}

export default function DocumentUpload({
  tripId,
  userId,
  documentType,
  existingUrl,
  onUploadComplete,
  onDelete,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingUrl || null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file))
      }

      // Upload to Supabase Storage with upsert
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${tripId}/${documentType}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600',
        })

      if (error) {
        console.error('Upload error:', error)
        alert('Failed to upload document. Please try again.')
        setUploading(false)
        return
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(fileName)

      onUploadComplete(publicUrl)
      setPreview(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingUrl || !onDelete) return

    try {
      // Extract file path from URL
      const urlParts = existingUrl.split('/documents/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage.from('documents').remove([filePath])
      }
      setPreview(null)
      onDelete()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  return (
    <div className="space-y-3">
      {preview || existingUrl ? (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Document uploaded</p>
                <p className="text-xs text-gray-500">Click to view or replace</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={preview || existingUrl || ''}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="View document"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </a>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete document"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${documentType}`}
            disabled={uploading}
          />
          <label
            htmlFor={`upload-${documentType}`}
            className="block mt-3 text-center"
          >
            <span className="text-xs text-primary hover:underline cursor-pointer">
              Replace document
            </span>
          </label>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${documentType}`}
            disabled={uploading}
          />
          <label
            htmlFor={`upload-${documentType}`}
            className={`cursor-pointer block ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 mx-auto text-primary mb-2 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF (max 10MB)</p>
          </label>
        </div>
      )}
    </div>
  )
}
