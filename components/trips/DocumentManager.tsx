'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DocumentUpload from './DocumentUpload'
import { FileText, Calendar, Hash, ExternalLink } from 'lucide-react'

interface Document {
  id: string
  document_type: string
  file_url: string
  document_number?: string
  expiry_date?: string
}

interface DocumentManagerProps {
  tripId: string
}

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'visa', label: 'Visa', icon: '📋' },
  { value: 'insurance', label: 'Travel Insurance', icon: '🛡️' },
  { value: 'driving_license', label: 'Driving License', icon: '🚗' },
  { value: 'vaccination', label: 'Vaccination Certificate', icon: '💉' },
  { value: 'other', label: 'Other Documents', icon: '📄' },
]

export default function DocumentManager({ tripId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDoc, setEditingDoc] = useState<{ id: string; number: string; expiry: string } | null>(
    null
  )
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [tripId])

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('trip_id', tripId)

    if (!error && data) {
      setDocuments(data)
    }
    setLoading(false)
  }

  const handleUploadComplete = async (documentType: string, fileUrl: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    const { error } = await supabase.from('documents').insert({
      trip_id: tripId,
      user_id: session.user.id,
      document_type: documentType,
      file_url: fileUrl,
    })

    if (!error) {
      fetchDocuments()
    }
  }

  const handleSaveDetails = async (docId: string, number: string, expiry: string) => {
    const { error } = await supabase
      .from('documents')
      .update({
        document_number: number || null,
        expiry_date: expiry || null,
      })
      .eq('id', docId)

    if (!error) {
      setEditingDoc(null)
      fetchDocuments()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Travel Documents</h3>
        <p className="text-gray-600 text-sm">
          Upload important documents for easy access during your trip
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const existingDoc = documents.find((d) => d.document_type === docType.value)

          return (
            <div key={docType.value} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{docType.icon}</span>
                <h4 className="font-semibold text-gray-900">{docType.label}</h4>
              </div>

              {existingDoc ? (
                <div className="space-y-4">
                  {/* Uploaded Document */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <a
                        href={existingDoc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View Document
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Document Details */}
                    {editingDoc?.id === existingDoc.id ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Document Number
                          </label>
                          <input
                            type="text"
                            value={editingDoc.number}
                            onChange={(e) =>
                              setEditingDoc({ ...editingDoc, number: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter number"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={editingDoc.expiry}
                            onChange={(e) =>
                              setEditingDoc({ ...editingDoc, expiry: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleSaveDetails(existingDoc.id, editingDoc.number, editingDoc.expiry)
                            }
                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDoc(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {existingDoc.document_number && (
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{existingDoc.document_number}</span>
                          </div>
                        )}
                        {existingDoc.expiry_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">
                              Expires: {new Date(existingDoc.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() =>
                            setEditingDoc({
                              id: existingDoc.id,
                              number: existingDoc.document_number || '',
                              expiry: existingDoc.expiry_date || '',
                            })
                          }
                          className="text-sm text-primary hover:underline"
                        >
                          {existingDoc.document_number || existingDoc.expiry_date
                            ? 'Edit Details'
                            : 'Add Details'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <DocumentUpload
                  tripId={tripId}
                  documentType={docType.value}
                  onUploadComplete={(url) => handleUploadComplete(docType.value, url)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
