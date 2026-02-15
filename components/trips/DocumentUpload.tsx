'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, FileText } from 'lucide-react'

interface DocumentUploadProps {
  tripId: string
  documentType: string
  onUploadComplete: (url: string) => void
}

export default function DocumentUpload({
  tripId,
  documentType,
  onUploadComplete,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
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

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${tripId}/${documentType}-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from('documents').upload(fileName, file)

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
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
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
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
        ) : (
          <>
            {uploading ? (
              <Loader2 className="w-8 h-8 mx-auto text-primary mb-2 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF (max 10MB)</p>
          </>
        )}
      </label>
    </div>
  )
}
