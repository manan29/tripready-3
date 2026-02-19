'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowLeft, Check, Upload, FileText } from 'lucide-react'

interface VisaDocsStepProps {
  trip: any
  stageData: any
  onBack: () => void
  onComplete: (data: any) => void
}

export function VisaDocsStep({ trip, stageData, onBack, onComplete }: VisaDocsStepProps) {
  const [visaStatus, setVisaStatus] = useState(stageData?.pre_trip?.visa_status || 'pending')
  const [checkedDocs, setCheckedDocs] = useState<string[]>([])

  const documents = [
    { id: 'passport', name: 'Passport', note: 'Valid for 6+ months' },
    { id: 'visa', name: 'Visa', note: 'Check requirement' },
    { id: 'insurance', name: 'Travel Insurance', note: 'Medical coverage' },
    { id: 'id-copies', name: 'ID Copies', note: 'Keep 2 photocopies' },
    { id: 'vaccine', name: 'Vaccination Certificate', note: 'If required' },
  ]

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  const handleComplete = () => {
    onComplete({
      ...stageData,
      pre_trip: {
        ...stageData?.pre_trip,
        visa_status: visaStatus,
        documents: checkedDocs,
        completed_steps: [...(stageData?.pre_trip?.completed_steps || []), 'visa-docs'],
      },
    })
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Visa & Documents</h2>
          <p className="text-sm text-gray-500">Essential travel documents</p>
        </div>
      </div>

      {/* Visa Status */}
      <GlassCard>
        <h3 className="font-semibold text-gray-800 mb-3">Visa Status for {trip.country}</h3>
        <div className="space-y-2">
          {['not-required', 'pending', 'applied', 'approved'].map((status) => (
            <label
              key={status}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                visaStatus === status ? 'bg-purple-50 border-2 border-purple-500' : 'bg-gray-50 border-2 border-transparent'
              }`}
            >
              <input
                type="radio"
                name="visa-status"
                checked={visaStatus === status}
                onChange={() => setVisaStatus(status)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="font-medium text-gray-800 capitalize">{status.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </GlassCard>

      {/* Document Checklist */}
      <GlassCard>
        <h3 className="font-semibold text-gray-800 mb-3">Document Checklist</h3>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => toggleDoc(doc.id)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                checkedDocs.includes(doc.id) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  checkedDocs.includes(doc.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}
              >
                {checkedDocs.includes(doc.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${checkedDocs.includes(doc.id) ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{doc.note}</p>
              </div>
              <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Important Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">Important</h4>
            <p className="text-blue-800 text-sm mt-1">
              Keep physical and digital copies of all documents. Store them in cloud for backup.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleComplete}
        disabled={checkedDocs.length === 0}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        Mark as Complete
      </button>
    </div>
  )
}
