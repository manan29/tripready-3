'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Plane, Hotel, Check, Plus, ExternalLink, TrendingDown, Sparkles, ChevronRight, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getDestinationImage } from '@/lib/destination-images';

type TabType = 'insights' | 'packing';

interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'kids' | 'adults' | 'indian' | 'priority';
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;
  const supabase = createClient();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'kids' | 'adults' | 'indian'>('adults');

  useEffect(() => { loadTrip(); }, [tripId]);

  const loadTrip = async () => {
    const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();
    if (error || !data) { router.push('/trips'); return; }
    setTrip(data);
    setPackingList(data.packing_list || []);
    setLoading(false);
  };

  const toggleItem = async (itemId: string) => {
    const updated = packingList.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item);
    setPackingList(updated);
    await supabase.from('trips').update({ packing_list: updated }).eq('id', tripId);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const item: PackingItem = { id: `c-${Date.now()}`, text: newItem.trim(), checked: false, category: newItemCategory };
    const updated = [...packingList, item];
    setPackingList(updated);
    setNewItem('');
    setShowAddItem(false);
    await supabase.from('trips').update({ packing_list: updated }).eq('id', tripId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0A7A6E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const preferences = trip?.trip_preferences || {};
  const flightTrends = preferences.flight_trends || {};
  const destinationImage = preferences.destination_image || getDestinationImage(trip.destination);
  const fromCity = preferences.from_city || 'Mumbai';

  const kidsItems = packingList.filter(i => i.category === 'kids');
  const adultsItems = packingList.filter(i => i.category === 'adults');
  const indianItems = packingList.filter(i => i.category === 'indian');

  const totalItems = packingList.length;
  const packedItems = packingList.filter(i => i.checked).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  const daysToGo = Math.max(0, Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-white to-[#F8F7F5]">
      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/trips')} className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <button className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
            <Share2 className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="px-4 pt-28 pb-4">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[#0A7A6E]/20">
          <img src={destinationImage} alt={trip.destination} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-white font-bold text-2xl mb-1">{trip.destination}</h1>
                <p className="text-white/70 text-sm">
                  {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {daysToGo > 0 && (
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-4 py-2 text-center">
                  <p className="text-white font-bold text-xl">{daysToGo}</p>
                  <p className="text-white/70 text-xs">days to go</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Tab Switcher */}
      <div className="px-4 mb-4">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-1.5 flex gap-1 shadow-lg shadow-black/5">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'insights'
                ? 'bg-[#0A7A6E] text-white shadow-lg shadow-[#0A7A6E]/30'
                : 'text-[#6B6B6B] hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Flight & Hotel Insights
          </button>
          <button
            onClick={() => setActiveTab('packing')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'packing'
                ? 'bg-[#0A7A6E] text-white shadow-lg shadow-[#0A7A6E]/30'
                : 'text-[#6B6B6B] hover:bg-white/50'
            }`}
          >
            🎒 Packing List
            {totalItems > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'packing' ? 'bg-white/20' : 'bg-[#0A7A6E]/10 text-[#0A7A6E]'}`}>
                {progress}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-8">
        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {/* Flight Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0A7A6E] to-[#0D9488] rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A1A]">Flight Insights</h2>
                  <p className="text-xs text-[#6B6B6B]">From {fromCity}</p>
                </div>
              </div>

              {/* Budget vs Comfort comparison */}
              <div className="space-y-3">
                {/* Budget Option */}
                <div className="bg-[#F8F7F5] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full font-medium">💰 Budget</span>
                      <p className="font-semibold text-[#1A1A1A] mt-2">IndiGo</p>
                      <p className="text-xs text-[#6B6B6B]">Direct • 3h 15m • Morning</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#1A1A1A]">₹{(flightTrends.lowestPrice || 14200).toLocaleString()}</p>
                      <p className="text-xs text-[#6B6B6B]">per person</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg">✓ Cheapest</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">15kg bag</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">No meal</span>
                  </div>
                </div>

                {/* Comfort Option */}
                <div className="bg-gradient-to-r from-[#F0FDFA] to-[#ECFDF5] rounded-2xl p-4 border-2 border-[#0A7A6E]/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#0A7A6E] text-white text-xs px-3 py-1 rounded-bl-xl font-medium">
                    ⭐ Recommended
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#1A1A1A] mt-4">Emirates</p>
                      <p className="text-xs text-[#6B6B6B]">Direct • 3h 15m • A380 Aircraft</p>
                    </div>
                    <div className="text-right mt-4">
                      <p className="text-xl font-bold text-[#0A7A6E]">₹{((flightTrends.lowestPrice || 14200) + 4000).toLocaleString()}</p>
                      <p className="text-xs text-[#6B6B6B]">+₹4,000/person</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-xs bg-[#0A7A6E]/10 text-[#0A7A6E] px-2 py-1 rounded-lg">✓ 30kg bag</span>
                    <span className="text-xs bg-[#0A7A6E]/10 text-[#0A7A6E] px-2 py-1 rounded-lg">✓ Free meal</span>
                    <span className="text-xs bg-[#0A7A6E]/10 text-[#0A7A6E] px-2 py-1 rounded-lg">✓ Extra legroom</span>
                  </div>
                  <div className="mt-3 p-2 bg-white/50 rounded-xl">
                    <p className="text-xs text-[#0A7A6E]">💡 Worth the extra ₹4K with a {trip.kid_ages?.[0] || 5} year old - more legroom, entertainment, and 2x baggage</p>
                  </div>
                </div>
              </div>

              {/* Price Trend Mini */}
              {flightTrends.trends?.length > 0 && flightTrends.savings > 500 && (
                <div className="mt-4 bg-green-50 rounded-2xl p-3 flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Price drops ₹{flightTrends.savings.toLocaleString()}</p>
                    <p className="text-xs text-green-600">If you fly on {new Date(flightTrends.lowestDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hotel Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-xl flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A1A]">Hotel Insights</h2>
                  <p className="text-xs text-[#6B6B6B]">{preferences.hotel_rating || 4}⭐ • {(preferences.amenities || ['Central']).slice(0, 2).join(', ')}</p>
                </div>
              </div>

              {/* Hotel Recommendation */}
              <div className="bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-2xl overflow-hidden">
                <div className="relative h-32">
                  <img src={destinationImage} alt="Hotel" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-medium text-[#7C3AED]">Best Match</div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">Rove Downtown</p>
                      <p className="text-xs text-[#6B6B6B]">⭐⭐⭐⭐ • Downtown</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#7C3AED]">₹8,500</p>
                      <p className="text-xs text-[#6B6B6B]">per night</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-xs bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-1 rounded-lg">🚇 Near Metro</span>
                    <span className="text-xs bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-1 rounded-lg">🏊 Kids Pool</span>
                    <span className="text-xs bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-1 rounded-lg">🍛 Indian Food</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-3 bg-[#F8F7F5] rounded-2xl text-sm font-medium text-[#6B6B6B] flex items-center justify-center gap-2">
                View more hotels <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Tips */}
            {preferences.things_to_know?.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
                <h2 className="font-bold text-[#1A1A1A] mb-3">💡 Quick Tips</h2>
                <div className="space-y-2">
                  {preferences.things_to_know.slice(0, 3).map((tip: string, i: number) => (
                    <p key={i} className="text-sm text-[#6B6B6B]">{tip}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PACKING TAB */}
        {activeTab === 'packing' && (
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-[#1A1A1A]">Your Progress</h2>
                  <p className="text-sm text-[#6B6B6B]">{packedItems} of {totalItems} items</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#E5E5E5" strokeWidth="6" fill="none" />
                    <circle cx="32" cy="32" r="28" stroke="#0A7A6E" strokeWidth="6" fill="none" strokeDasharray={`${progress * 1.76} 176`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#0A7A6E]">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kids Section */}
            {kidsItems.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg shadow-black/5">
                <div className="p-4 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👶</span>
                      <span className="font-semibold text-[#92400E]">For Kids</span>
                    </div>
                    <span className="text-sm text-[#92400E]">{kidsItems.filter(i => i.checked).length}/{kidsItems.length}</span>
                  </div>
                </div>
                <div className="p-2">
                  {kidsItems.map((item) => (
                    <button key={item.id} onClick={() => toggleItem(item.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F7F5] transition-colors">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-[#0A7A6E] border-[#0A7A6E]' : 'border-[#D1D5DB]'}`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`flex-1 text-left text-sm ${item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adults Section */}
            {adultsItems.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg shadow-black/5">
                <div className="p-4 bg-gradient-to-r from-[#DBEAFE] to-[#BFDBFE]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👨‍👩</span>
                      <span className="font-semibold text-[#1E40AF]">For Adults</span>
                    </div>
                    <span className="text-sm text-[#1E40AF]">{adultsItems.filter(i => i.checked).length}/{adultsItems.length}</span>
                  </div>
                </div>
                <div className="p-2">
                  {adultsItems.map((item) => (
                    <button key={item.id} onClick={() => toggleItem(item.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F7F5] transition-colors">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-[#0A7A6E] border-[#0A7A6E]' : 'border-[#D1D5DB]'}`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`flex-1 text-left text-sm ${item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Indian Essentials */}
            {indianItems.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg shadow-black/5">
                <div className="p-4 bg-gradient-to-r from-[#FED7AA] to-[#FDBA74]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇮🇳</span>
                      <span className="font-semibold text-[#9A3412]">Indian Essentials</span>
                    </div>
                    <span className="text-sm text-[#9A3412]">{indianItems.filter(i => i.checked).length}/{indianItems.length}</span>
                  </div>
                </div>
                <div className="p-2">
                  {indianItems.map((item) => (
                    <button key={item.id} onClick={() => toggleItem(item.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F7F5] transition-colors">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-[#0A7A6E] border-[#0A7A6E]' : 'border-[#D1D5DB]'}`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`flex-1 text-left text-sm ${item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Item Button */}
            <button onClick={() => setShowAddItem(true)} className="w-full py-4 bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-dashed border-[#0A7A6E]/30 text-[#0A7A6E] font-medium flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add custom item
            </button>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1A1A1A]">Add Item</h3>
              <button onClick={() => setShowAddItem(false)} className="w-8 h-8 bg-[#F8F7F5] rounded-full flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="What do you need to pack?"
              className="w-full px-4 py-3 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] outline-none focus:border-[#0A7A6E] mb-4"
              autoFocus
            />
            <div className="flex gap-2 mb-4">
              {(['kids', 'adults', 'indian'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewItemCategory(cat)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium ${newItemCategory === cat ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'}`}
                >
                  {cat === 'kids' ? '👶 Kids' : cat === 'adults' ? '👨‍👩 Adults' : '🇮🇳 Indian'}
                </button>
              ))}
            </div>
            <button onClick={addItem} disabled={!newItem.trim()} className={`w-full py-4 rounded-xl font-semibold ${newItem.trim() ? 'bg-[#0A7A6E] text-white' : 'bg-[#E5E5E5] text-[#9CA3AF]'}`}>
              Add to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
