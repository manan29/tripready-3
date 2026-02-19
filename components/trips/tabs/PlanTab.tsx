'use client';

import { useState } from 'react';
import { FileText, Plane, CreditCard, Wallet, Plus, X, Upload, Hotel } from 'lucide-react';

interface PlanTabProps {
  trip: any;
}

export function PlanTab({ trip }: PlanTabProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="space-y-4 pb-24">
      {/* 2x2 Grid of Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Documents Card */}
        <div
          onClick={() => setActiveModal('documents')}
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-lg mb-3">Documents</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{trip.documents?.length || 0}</p>
              <p className="text-gray-400 text-sm">items</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div
          onClick={() => setActiveModal('bookings')}
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-lg mb-3">Bookings</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{trip.bookings?.length || 0}</p>
              <p className="text-gray-400 text-sm">flights/hotels</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
              <Plane className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Visa Card */}
        <div
          onClick={() => setActiveModal('visa')}
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-lg mb-3">Visa</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{trip.visa ? '✓' : '0'}</p>
              <p className="text-gray-400 text-sm">{trip.visa ? 'uploaded' : 'pending'}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div
          onClick={() => setActiveModal('budget')}
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-lg mb-3">Budget</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">₹{trip.budget || 0}</p>
              <p className="text-gray-400 text-sm">spent</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENTS MODAL */}
      {activeModal === 'documents' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Documents</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { id: 'passport', name: 'Passport', icon: '🛂' },
                { id: 'visa', name: 'Visa', icon: '📋' },
                { id: 'insurance', name: 'Insurance', icon: '🛡️' },
                { id: 'tickets', name: 'Tickets', icon: '🎫' },
                { id: 'hotel', name: 'Hotel Booking', icon: '🏨' },
                { id: 'other', name: 'Other', icon: '📄' },
              ].map((doc) => (
                <label
                  key={doc.id}
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <input type="file" accept="image/*,.pdf" className="hidden" />
                  <span className="text-3xl mb-2">{doc.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                  <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS MODAL */}
      {activeModal === 'bookings' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Bookings</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Add Flight */}
              <button className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Plane className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Flight</p>
                  <p className="text-sm text-gray-400">Enter PNR to auto-fetch details</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {/* Add Hotel */}
              <button className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Hotel className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Hotel</p>
                  <p className="text-sm text-gray-400">Add your accommodation details</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISA MODAL */}
      {activeModal === 'visa' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Visa for {trip.country}</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Visa Status */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-medium text-amber-800">⚠️ Visa Required</p>
                <p className="text-sm text-amber-600 mt-1">
                  Indian passport holders need a visa for {trip.country}
                </p>
              </div>

              {/* Upload Visa */}
              <label className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50">
                <input type="file" accept="image/*,.pdf" className="hidden" />
                <CreditCard className="w-12 h-12 text-purple-400 mb-2" />
                <p className="font-medium">Upload Visa</p>
                <p className="text-sm text-gray-400">PDF or Image</p>
              </label>

              {/* Visa Info Link */}
              <a
                href={`https://www.google.com/search?q=${trip.country}+visa+for+indian+passport`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-purple-600 underline text-sm"
              >
                Check visa requirements for {trip.country} →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BUDGET MODAL */}
      {activeModal === 'budget' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Trip Budget</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-center py-4">
                <p className="text-gray-400">Total Spent</p>
                <p className="text-4xl font-bold text-purple-600">₹{trip.budget || 0}</p>
              </div>

              <button className="w-full flex items-center justify-center gap-2 p-4 bg-purple-600 text-white rounded-xl font-medium">
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
