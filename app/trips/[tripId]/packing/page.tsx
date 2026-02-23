'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Plus, Check, AlertCircle, Baby, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'priority' | 'kids' | 'adults';
  reason?: string;
}

export default function PackingListPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;
  const supabase = createClient();

  const [trip, setTrip] = useState<any>(null);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'kids' | 'adults'>('all');
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error || !data) {
      router.push('/trips');
      return;
    }

    setTrip(data);
    setPackingList(data.packing_list || []);
    setLoading(false);
  };

  const toggleItem = async (itemId: string) => {
    const updated = packingList.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setPackingList(updated);

    await supabase
      .from('trips')
      .update({ packing_list: updated })
      .eq('id', tripId);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    const newPackingItem: PackingItem = {
      id: `custom-${Date.now()}`,
      text: newItem.trim(),
      checked: false,
      category: activeTab === 'all' ? 'adults' : activeTab,
    };

    const updated = [...packingList, newPackingItem];
    setPackingList(updated);
    setNewItem('');

    await supabase
      .from('trips')
      .update({ packing_list: updated })
      .eq('id', tripId);
  };

  const getFilteredItems = () => {
    if (activeTab === 'all') return packingList;
    if (activeTab === 'kids') return packingList.filter(i => i.category === 'kids' || i.category === 'priority');
    return packingList.filter(i => i.category === 'adults');
  };

  const priorityItems = packingList.filter(i => i.category === 'priority');
  const kidsItems = packingList.filter(i => i.category === 'kids');
  const adultsItems = packingList.filter(i => i.category === 'adults');

  const packedCount = packingList.filter(i => i.checked).length;
  const totalCount = packingList.length;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0A7A6E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Packing List</h1>
            <p className="text-sm text-[#6B6B6B]">{trip?.destination} Trip</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center">
          <Share2 className="w-5 h-5 text-[#1A1A1A]" />
        </button>
      </header>

      <div className="px-5">
        <div className="bg-[#F8F7F5] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B6B6B]">Packing Progress</span>
            <span className="text-sm font-bold text-[#0A7A6E]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A7A6E] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#6B6B6B] mt-2">{packedCount} of {totalCount} items packed</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm ${activeTab === 'all' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A]'}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('kids')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm ${activeTab === 'kids' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A]'}`}
          >
            👶 Kids ({kidsItems.length + priorityItems.length})
          </button>
          <button
            onClick={() => setActiveTab('adults')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm ${activeTab === 'adults' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A]'}`}
          >
            👨‍👩 Adults ({adultsItems.length})
          </button>
        </div>

        {(activeTab === 'all' || activeTab === 'kids') && priorityItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-[#1A1A1A]">Priority - Health Items</h3>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {priorityItems.filter(i => !i.checked).length} left
              </span>
            </div>
            <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
              {priorityItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left ${index < priorityItems.length - 1 ? 'border-b border-red-100' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${item.checked ? 'bg-[#0A7A6E] border-[#0A7A6E]' : 'border-red-300'}`}>
                    {item.checked && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <span className={`font-medium ${item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>{item.text}</span>
                    {item.reason && <p className="text-xs text-red-600 mt-0.5">{item.reason}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'kids') && kidsItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="w-5 h-5 text-[#0A7A6E]" />
              <h3 className="font-semibold text-[#1A1A1A]">For Kids</h3>
              <span className="text-xs bg-[#F0FDFA] text-[#0A7A6E] px-2 py-0.5 rounded-full">
                {kidsItems.filter(i => i.checked).length}/{kidsItems.length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
              {kidsItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left ${index < kidsItems.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-[#0A7A6E] border-[#0A7A6E]' : 'border-[#D1D5DB]'}`}>
                    {item.checked && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'adults') && adultsItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-[#0A7A6E]" />
              <h3 className="font-semibold text-[#1A1A1A]">For Adults</h3>
              <span className="text-xs bg-[#F0FDFA] text-[#0A7A6E] px-2 py-0.5 rounded-full">
                {adultsItems.filter(i => i.checked).length}/{adultsItems.length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
              {adultsItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left ${index < adultsItems.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-[#0A7A6E] border-[#0A7A6E]' : 'border-[#D1D5DB]'}`}>
                    {item.checked && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add custom item..."
            className="flex-1 px-4 py-3 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] outline-none focus:border-[#0A7A6E]"
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className="w-12 h-12 bg-[#0A7A6E] rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
