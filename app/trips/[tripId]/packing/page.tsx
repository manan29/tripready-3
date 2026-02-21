'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PackingItem {
  id: string;
  text: string;
  packed: boolean;
}

export default function PackingListPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const supabase = createClient();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kids' | 'adults'>('kids');
  const [kidsItems, setKidsItems] = useState<PackingItem[]>([]);
  const [adultsItems, setAdultsItems] = useState<PackingItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [generating, setGenerating] = useState(false);

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

      // Load saved packing lists
      if (tripData.packing_list_kids) {
        setKidsItems(tripData.packing_list_kids);
      }
      if (tripData.packing_list_adults) {
        setAdultsItems(tripData.packing_list_adults);
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWithAI = async () => {
    if (!trip) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination,
          startDate: trip.start_date,
          endDate: trip.end_date,
          numKids: trip.num_kids || 0,
          kidAges: trip.kid_ages || [],
          numAdults: trip.num_adults || 2,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();

      // Convert to PackingItem format
      const kidsPackingItems: PackingItem[] = data.kids.map((text: string, index: number) => ({
        id: `kid-${Date.now()}-${index}`,
        text,
        packed: false,
      }));

      const adultsPackingItems: PackingItem[] = data.adults.map((text: string, index: number) => ({
        id: `adult-${Date.now()}-${index}`,
        text,
        packed: false,
      }));

      setKidsItems(kidsPackingItems);
      setAdultsItems(adultsPackingItems);

      // Save to database
      await supabase
        .from('trips')
        .update({
          packing_list_kids: kidsPackingItems,
          packing_list_adults: adultsPackingItems,
        })
        .eq('id', tripId);
    } catch (error) {
      console.error('Error generating packing list:', error);
      alert('Failed to generate packing list');
    } finally {
      setGenerating(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    const item: PackingItem = {
      id: `${Date.now()}`,
      text: newItem.trim(),
      packed: false,
    };

    if (activeTab === 'kids') {
      const updated = [...kidsItems, item];
      setKidsItems(updated);
      await supabase.from('trips').update({ packing_list_kids: updated }).eq('id', tripId);
    } else {
      const updated = [...adultsItems, item];
      setAdultsItems(updated);
      await supabase.from('trips').update({ packing_list_adults: updated }).eq('id', tripId);
    }

    setNewItem('');
  };

  const toggleItem = async (id: string) => {
    if (activeTab === 'kids') {
      const updated = kidsItems.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      );
      setKidsItems(updated);
      await supabase.from('trips').update({ packing_list_kids: updated }).eq('id', tripId);
    } else {
      const updated = adultsItems.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      );
      setAdultsItems(updated);
      await supabase.from('trips').update({ packing_list_adults: updated }).eq('id', tripId);
    }
  };

  const deleteItem = async (id: string) => {
    if (activeTab === 'kids') {
      const updated = kidsItems.filter(item => item.id !== id);
      setKidsItems(updated);
      await supabase.from('trips').update({ packing_list_kids: updated }).eq('id', tripId);
    } else {
      const updated = adultsItems.filter(item => item.id !== id);
      setAdultsItems(updated);
      await supabase.from('trips').update({ packing_list_adults: updated }).eq('id', tripId);
    }
  };

  const currentItems = activeTab === 'kids' ? kidsItems : adultsItems;
  const packedCount = currentItems.filter(item => item.packed).length;
  const totalCount = currentItems.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

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
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Packing List</h1>
            <p className="text-sm text-[#6B6B6B]">{trip?.destination}</p>
          </div>
        </div>

        {/* AI Generate Button */}
        <button
          onClick={generateWithAI}
          disabled={generating}
          className="w-full bg-[#0A7A6E] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {generating ? 'Generating...' : 'Generate with AI'}
        </button>
      </header>

      {/* Tabs */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('kids')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'kids' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}
          >
            Kids ({kidsItems.length})
          </button>
          <button
            onClick={() => setActiveTab('adults')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'adults' ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}
          >
            Adults ({adultsItems.length})
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="px-5 pb-4">
          <div className="bg-[#F8F7F5] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0A7A6E] h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-[#6B6B6B] mt-2">
            {packedCount} of {totalCount} packed ({Math.round(progress)}%)
          </p>
        </div>
      )}

      {/* Add Item */}
      <div className="px-5 pb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new item..."
            className="flex-1 bg-[#F8F7F5] border border-[#E5E5E5] rounded-xl px-4 py-3 outline-none focus:border-[#0A7A6E] text-[#1A1A1A] placeholder-[#9CA3AF]"
          />
          <button
            onClick={addItem}
            className="w-12 h-12 bg-[#0A7A6E] rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="px-5">
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-[#0A7A6E]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No items yet</h2>
            <p className="text-[#6B6B6B] mb-6">Generate a smart packing list with AI or add items manually</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white border border-[#F0F0F0] rounded-xl p-4"
              >
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => toggleItem(item.id)}
                  className="w-5 h-5 rounded border-2 border-[#E5E5E5] text-[#0A7A6E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className={`flex-1 ${item.packed ? 'text-[#9CA3AF] line-through' : 'text-[#1A1A1A]'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
