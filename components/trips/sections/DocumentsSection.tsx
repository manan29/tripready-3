'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Check, Eye, FileText } from 'lucide-react'

interface DocumentsSectionProps {
  tripId: string
}

const documentTypes = [
  { type: 'passport', label: 'Passport', icon: '🛂', color: 'bg-orange-500' },
  { type: 'visa', label: 'Visa', icon: '📋', color: 'bg-purple-500' },
  { type: 'insurance', label: 'Insurance', icon: '🛡️', color: 'bg-blue-500' },
  { type: 'license', label: 'License', icon: '🚗', color: 'bg-green-500' },
  { type: 'vaccination', label: 'Vaccination', icon: '💉', color: 'bg-red-500' },
]

export default function DocumentsSection({ tripId }: DocumentsSectionProps) {
  const supabase = createClient()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [tripId])

  const fetchDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').eq('trip_id', tripId)

    if (data) setDocuments(data)
    setLoading(false)
  }

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${tripId}/${docType}-${Date.now()}.${fileExt}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      alert('Upload failed. Please try again.')
      setUploading(null)
      return
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('documents').getPublicUrl(fileName)

    // Save to database
    const { error: dbError } = await supabase.from('documents').insert({
      trip_id: tripId,
      user_id: user.id,
      document_type: docType,
      file_url: publicUrl,
    })

    if (!dbError) {
      fetchDocuments()
    }

    setUploading(null)
  }

  const getDocumentStatus = (type: string) => {
    return documents.find((d) => d.document_type === type)
  }

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {documentTypes.map((doc) => {
        const uploaded = getDocumentStatus(doc.type)
        const isUploading = uploading === doc.type

        return (
          <div key={doc.type} className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(doc.type, file)
              }}
              className="hidden"
              id={`doc-${doc.type}`}
              disabled={isUploading}
            />
            <label
              htmlFor={`doc-${doc.type}`}
              className={`
                flex flex-col items-center p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
                ${uploaded ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-purple-300'}
              `}
            >
              <div
                className={`w-12 h-12 ${doc.color} rounded-full flex items-center justify-center text-2xl mb-2`}
              >
                {doc.icon}
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">{doc.label}</span>
              {isUploading ? (
                <span className="text-xs text-purple-500 mt-1">Uploading...</span>
              ) : uploaded ? (
                <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Added
                </span>
              ) : (
                <span className="text-xs text-gray-400 mt-1">Tap to upload</span>
              )}
            </label>

            {/* View button for uploaded docs */}
            {uploaded && (
              <a
                href={uploaded.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-3 h-3 text-gray-600" />
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
