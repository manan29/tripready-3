'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Plane, Hotel, Check, Plus, ChevronRight, TrendingDown, ExternalLink, X } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs } from '@/components/ui/Tabs';
import { Checkbox } from '@/components/ui/Checkbox';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HeroCard } from '@/components/patterns/HeroCard';
import { FlightCard } from '@/components/patterns/FlightCard';
import { createClient } from '@/lib/supabase/client';
import { getDestinationImage } from '@/lib/destination-images';
import { cn } from '@/lib/design-system/cn';

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
      <Screen className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </Screen>
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

  const tabs = [
    { id: 'insights', label: 'Insights', icon: <Plane className="w-4 h-4" /> },
    { id: 'packing', label: 'Packing', icon: <span>🎒</span>, badge: `${progress}%` },
  ];

  return (
    <Screen gradient={false} className="bg-neutral-50">
      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-safe-top pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/trips')}
            className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-lg shadow-neutral-900/10"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-900" />
          </button>
          <button className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-lg shadow-neutral-900/10">
            <Share2 className="w-5 h-5 text-neutral-900" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-20 pb-4">
        <HeroCard
          image={destinationImage}
          title={trip.destination}
          subtitle={`${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • From ${fromCity}`}
          height="md"
          badge={
            daysToGo > 0 ? (
              <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-center shadow-lg">
                <p className="text-lg font-bold text-neutral-900">{daysToGo}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">days</p>
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as TabType)}
            variant="pills"
            size="md"
            className="w-full"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-8">
        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="space-y-4 animate-fade-in">
            {/* Flight Insights */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900">Flight Insights</h2>
                  <p className="text-sm text-neutral-500">From {fromCity}</p>
                </div>
              </div>

              {/* Flight Comparison */}
              <div className="space-y-3">
                <FlightCard
                  airline="IndiGo"
                  departure="07:15"
                  arrival="09:30"
                  duration="3h 15m"
                  price={flightTrends.lowestPrice || 14200}
                  badge="budget"
                  pros={['Cheapest', 'Direct']}
                  cons={['15kg bag', 'No meal']}
                />

                <FlightCard
                  airline="Emirates"
                  departure="07:30"
                  arrival="09:45"
                  duration="3h 15m"
                  price={(flightTrends.lowestPrice || 14200) + 4000}
                  badge="comfort"
                  pros={['30kg bag', 'Free meal', 'Extra legroom']}
                  insight={`💡 Worth ₹4K extra with a ${trip.kid_ages?.[0] || 5} year old - more space, entertainment, 2x baggage`}
                />
              </div>

              {/* Price Trend */}
              {flightTrends.trends?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-neutral-100">
                  <p className="text-sm font-medium text-neutral-700 mb-3">📊 Price Trend (20 days)</p>
                  <div className="h-16 flex items-end gap-0.5 bg-neutral-50 rounded-xl p-3">
                    {flightTrends.trends.slice(0, 20).map((t: any, i: number) => {
                      const prices = flightTrends.trends.map((x: any) => x.price);
                      const max = Math.max(...prices);
                      const min = Math.min(...prices);
                      const h = max > min ? ((t.price - min) / (max - min)) * 100 : 50;
                      const isLowest = t.price === flightTrends.lowestPrice;
                      return (
                        <div
                          key={i}
                          className={cn(
                            'flex-1 rounded-t transition-all',
                            isLowest ? 'bg-emerald-500' : i === 0 ? 'bg-primary-500' : 'bg-neutral-200'
                          )}
                          style={{ height: `${Math.max(h, 10)}%` }}
                        />
                      );
                    })}
                  </div>
                  {flightTrends.savings > 500 && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Save ₹{flightTrends.savings.toLocaleString()} on {new Date(flightTrends.lowestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Hotel Insights */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900">Hotel Insights</h2>
                  <p className="text-sm text-neutral-500">{preferences.hotel_rating || 4}⭐ • {(preferences.amenities || ['Central']).slice(0, 2).join(', ')}</p>
                </div>
              </div>

              {/* Hotel Recommendation */}
              <div className="rounded-2xl overflow-hidden border border-violet-100 bg-gradient-to-br from-violet-50/50 to-white">
                <div className="relative h-32">
                  <img src={destinationImage} alt="Hotel" className="w-full h-full object-cover" />
                  <Badge variant="primary" className="absolute top-3 right-3 bg-violet-500 text-white border-0">
                    Best Match
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-neutral-900">Rove Downtown</p>
                      <p className="text-sm text-neutral-500">⭐⭐⭐⭐ • Downtown</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-violet-600">₹8,500</p>
                      <p className="text-xs text-neutral-500">per night</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-lg">🚇 Near Metro</span>
                    <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-lg">🏊 Kids Pool</span>
                    <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-lg">🍛 Indian Food</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            {preferences.things_to_know?.length > 0 && (
              <Card variant="elevated" padding="lg">
                <h3 className="font-bold text-neutral-900 mb-3">💡 Quick Tips</h3>
                <div className="space-y-2.5">
                  {preferences.things_to_know.slice(0, 4).map((tip: string, i: number) => (
                    <p key={i} className="text-sm text-neutral-600 leading-relaxed">{tip}</p>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* PACKING TAB */}
        {activeTab === 'packing' && (
          <div className="space-y-4 animate-fade-in">
            {/* Progress Card */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-neutral-900">Your Progress</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">{packedItems} of {totalItems} items packed</p>
                </div>
                <Progress value={progress} variant="circular" size="lg" showLabel />
              </div>
            </Card>

            {/* Kids Section */}
            {kidsItems.length > 0 && (
              <Card variant="default" padding="none" className="overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👶</span>
                      <span className="font-semibold text-amber-900">For Kids</span>
                    </div>
                    <Badge variant="warning" size="sm">{kidsItems.filter(i => i.checked).length}/{kidsItems.length}</Badge>
                  </div>
                </div>
                <div className="px-4 divide-y divide-neutral-50">
                  {kidsItems.map((item) => (
                    <div key={item.id} className="py-3">
                      <Checkbox
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        label={item.text}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Adults Section */}
            {adultsItems.length > 0 && (
              <Card variant="default" padding="none" className="overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-sky-100/50 border-b border-sky-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👨‍👩</span>
                      <span className="font-semibold text-sky-900">For Adults</span>
                    </div>
                    <Badge variant="info" size="sm">{adultsItems.filter(i => i.checked).length}/{adultsItems.length}</Badge>
                  </div>
                </div>
                <div className="px-4 divide-y divide-neutral-50">
                  {adultsItems.map((item) => (
                    <div key={item.id} className="py-3">
                      <Checkbox
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        label={item.text}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Indian Essentials */}
            {indianItems.length > 0 && (
              <Card variant="default" padding="none" className="overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇮🇳</span>
                      <span className="font-semibold text-orange-900">Indian Essentials</span>
                    </div>
                    <Badge variant="warning" size="sm">{indianItems.filter(i => i.checked).length}/{indianItems.length}</Badge>
                  </div>
                </div>
                <div className="px-4 divide-y divide-neutral-50">
                  {indianItems.map((item) => (
                    <div key={item.id} className="py-3">
                      <Checkbox
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        label={item.text}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Add Item Button */}
            <Button
              variant="outline"
              size="lg"
              fullWidth
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowAddItem(true)}
              className="border-dashed border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              Add custom item
            </Button>
          </div>
        )}
      </div>

      {/* Add Item Bottom Sheet */}
      <BottomSheet
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Add Item"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="What do you need to pack?"
            className="w-full px-4 py-3.5 bg-neutral-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all"
            autoFocus
          />

          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Category</p>
            <div className="flex gap-2">
              {(['kids', 'adults', 'indian'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewItemCategory(cat)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                    newItemCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  )}
                >
                  {cat === 'kids' ? '👶 Kids' : cat === 'adults' ? '👨‍👩 Adults' : '🇮🇳 Indian'}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="xl"
            fullWidth
            onClick={addItem}
            disabled={!newItem.trim()}
          >
            Add to List
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
