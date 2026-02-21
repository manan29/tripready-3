'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Download, Trash2, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploaded_at: string;
}

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trip, setTrip] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      const { data: tripData, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error || !tripData) {
        router.push('/trips');
        return;
      }

      setTrip(tripData);

      // Load documents from storage
      const { data: files, error: filesError } = await supabase
        .storage
        .from('documents')
        .list(`${tripId}/`);

      if (filesError) {
        console.error('Error loading documents:', filesError);
      } else if (files) {
        const docsWithUrls = await Promise.all(
          files.map(async (file) => {
            const { data } = supabase
              .storage
              .from('documents')
              .getPublicUrl(`${tripId}/${file.name}`);

            return {
              id: file.id,
              name: file.name,
              type: file.metadata?.mimetype || 'application/octet-stream',
              url: data.publicUrl,
              size: file.metadata?.size || 0,
              uploaded_at: file.created_at || new Date().toISOString(),
            };
          })
        );
        setDocuments(docsWithUrls);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${tripId}/${fileName}`;

        const { data, error } = await supabase
          .storage
          .from('documents')
          .upload(filePath, file);

        if (error) throw error;
      }

      // Reload documents
      await loadData();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteDocument = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .storage
        .from('documents')
        .remove([`${tripId}/${fileName}`]);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.name !== fileName));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A7A6E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#6B6B6B] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-6 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Documents</h1>
            <p className="text-sm text-[#6B6B6B]">{trip?.destination}</p>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-[#0A7A6E] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </header>

      {/* Documents List */}
      <div className="px-5 pt-6">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-[#0A7A6E]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No documents yet</h2>
            <p className="text-[#6B6B6B] mb-6">Upload your travel documents, visas, tickets, and more</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#F0F0F0] rounded-xl p-4 flex items-center gap-4"
              >
                <div className="text-3xl">{getFileIcon(doc.type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A1A] truncate">{doc.name}</h3>
                  <p className="text-sm text-[#6B6B6B]">
                    {formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F8F7F5] text-[#0A7A6E] hover:bg-[#F0FDFA] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F8F7F5] text-[#0A7A6E] hover:bg-[#F0FDFA] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteDocument(doc.name)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F8F7F5] text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="px-5 pt-6">
        <div className="bg-[#F0FDFA] border border-[#0A7A6E]/20 rounded-xl p-4">
          <p className="text-sm text-[#065F56]">
            <strong>Tip:</strong> Upload passports, visas, tickets, hotel confirmations, and insurance documents for easy access during your trip.
          </p>
        </div>
      </div>
    </div>
  );
}
