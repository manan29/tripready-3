'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Calendar, Users, Baby, Check, Loader2, MapPin } from 'lucide-react';
import { getDestinationImage } from '@/lib/destination-images';
import { createClient } from '@/lib/supabase/client';

interface TripData {
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  num_adults: number;
  num_kids: number;
  kid_ages: number[];
}

interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'kids' | 'adults';
}

function TripCreationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const [step, setStep] = useState<'loading' | 'parsing' | 'manual-input' | 'kids-age' | 'preview' | 'packing' | 'login' | 'saving'>('loading');
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [kidAges, setKidAges] = useState<number[]>([]);
  const [numKids, setNumKids] = useState(1);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [manualDestination, setManualDestination] = useState('');
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');
  const [manualAdults, setManualAdults] = useState(2);
  const [manualKids, setManualKids] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 30);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setManualStartDate(start.toISOString().split('T')[0]);
    setManualEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      if (query) {
        parseQuery();
      } else {
        setStep('manual-input');
      }
    };
    init();
  }, []);

  const parseQuery = async () => {
    setStep('parsing');
    try {
      const response = await fetch('/api/ai/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();

      if (data.error) {
        setManualDestination(query);
        setStep('manual-input');
        return;
      }

      setTripData(data);

      if (data.num_kids > 0 && (!data.kid_ages || data.kid_ages.length === 0)) {
        setNumKids(data.num_kids);
        setKidAges(Array(data.num_kids).fill(3));
        setStep('kids-age');
      } else {
        setStep('preview');
      }
    } catch (err) {
      setManualDestination(query);
      setStep('manual-input');
    }
  };

  const handleManualSubmit = () => {
    if (!manualDestination || !manualStartDate || !manualEndDate) {
      setError('Please fill all required fields');
      return;
    }
    setError(null);
    const data: TripData = {
      destination: manualDestination,
      country: '',
      start_date: manualStartDate,
      end_date: manualEndDate,
      num_adults: manualAdults,
      num_kids: manualKids,
      kid_ages: [],
    };
    setTripData(data);
    if (manualKids > 0) {
      setNumKids(manualKids);
      setKidAges(Array(manualKids).fill(3));
      setStep('kids-age');
    } else {
      setStep('preview');
    }
  };

  const handleKidAgesSubmit = () => {
    if (tripData) {
      setTripData({ ...tripData, kid_ages: kidAges, num_kids: numKids });
    }
    setStep('preview');
  };

  const handlePreviewConfirm = async () => {
    setStep('packing');
    await generatePackingList();
  };

  const generatePackingList = async () => {
    try {
      const response = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripData?.destination,
          startDate: tripData?.start_date,
          endDate: tripData?.end_date,
          numKids: tripData?.num_kids || 0,
          kidAges: tripData?.kid_ages || [],
          numAdults: tripData?.num_adults || 2,
        }),
      });

      const data = await response.json();

      // Convert API response to PackingItem format
      const kidsItems: PackingItem[] = (data.kids || []).map((text: string, index: number) => ({
        id: `kid-${index}`,
        text,
        checked: false,
        category: 'kids' as const,
      }));

      const adultsItems: PackingItem[] = (data.adults || []).map((text: string, index: number) => ({
        id: `adult-${index}`,
        text,
        checked: false,
        category: 'adults' as const,
      }));

      setPackingList([...kidsItems, ...adultsItems]);
    } catch (err) {
      console.error('Failed to generate packing list:', err);
      setPackingList(getFallbackPackingList(tripData?.num_kids || 0));
    }
  };

  const getFallbackPackingList = (numKids: number): PackingItem[] => {
    const kidItems = numKids > 0 ? [
      { id: 'k1', text: 'Kids sunscreen SPF 50', checked: false, category: 'kids' as const },
      { id: 'k2', text: 'Light cotton clothes', checked: false, category: 'kids' as const },
      { id: 'k3', text: 'Favorite toys', checked: false, category: 'kids' as const },
      { id: 'k4', text: 'Snacks from India', checked: false, category: 'kids' as const },
      { id: 'k5', text: 'Kids medicines (Crocin, ORS)', checked: false, category: 'kids' as const },
    ] : [];
    return [
      ...kidItems,
      { id: 'a1', text: 'Passport & Visa copies', checked: false, category: 'adults' as const },
      { id: 'a2', text: 'Phone charger & power bank', checked: false, category: 'adults' as const },
      { id: 'a3', text: 'Universal adapter', checked: false, category: 'adults' as const },
      { id: 'a4', text: 'Toiletries', checked: false, category: 'adults' as const },
      { id: 'a5', text: 'Medications', checked: false, category: 'adults' as const },
    ];
  };

  const handlePackingContinue = () => {
    if (isLoggedIn) {
      saveTrip();
    } else {
      setStep('login');
    }
  };

  const handleLoginClick = () => {
    localStorage.setItem('pendingTrip', JSON.stringify({ tripData, packingList }));
    router.push('/login?redirect=/trips/new/save');
  };

  const saveTrip = async () => {
    setStep('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStep('login');
        return;
      }

      // Convert PackingItem[] to the format expected by database
      const kidsPackingItems = packingList
        .filter(item => item.category === 'kids')
        .map(item => ({
          id: item.id,
          text: item.text,
          packed: item.checked,
        }));

      const adultsPackingItems = packingList
        .filter(item => item.category === 'adults')
        .map(item => ({
          id: item.id,
          text: item.text,
          packed: item.checked,
        }));

      const { data, error: saveError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: tripData?.destination,
          country: tripData?.country || '',
          start_date: tripData?.start_date,
          end_date: tripData?.end_date,
          num_adults: tripData?.num_adults || 2,
          num_kids: tripData?.num_kids || 0,
          kid_ages: tripData?.kid_ages || [],
          packing_list_kids: kidsPackingItems,
          packing_list_adults: adultsPackingItems,
          status: 'upcoming',
        })
        .select()
        .single();

      if (saveError) {
        alert('Failed to save: ' + saveError.message);
        setStep('packing');
        return;
      }
      router.push(`/trips/${data.id}`);
    } catch (err) {
      alert('Failed to save trip');
      setStep('packing');
    }
  };

  if (step === 'loading' || isLoggedIn === null) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#0A7A6E] animate-spin" /></div>;
  }

  if (step === 'parsing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5">
        <Sparkles className="w-12 h-12 text-[#0A7A6E] animate-pulse mb-4" />
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Planning your trip...</h2>
        <p className="text-[#6B6B6B] text-center">"{query}"</p>
      </div>
    );
  }

  if (step === 'manual-input') {
    return (
      <div className="min-h-screen bg-white">
        <header className="px-5 pt-12 pb-4 flex items-center gap-4">
          <button onClick={() => router.push('/')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-[#1A1A1A]" /></button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Plan Your Trip</h1>
        </header>
        <div className="px-5 py-6 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Where are you going? *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input type="text" value={manualDestination} onChange={(e) => setManualDestination(e.target.value)} placeholder="e.g., Dubai, Singapore" className="w-full pl-12 pr-4 py-4 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:border-[#0A7A6E]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Start Date *</label>
              <input type="date" value={manualStartDate} onChange={(e) => setManualStartDate(e.target.value)} className="w-full px-4 py-4 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] text-[#1A1A1A] outline-none focus:border-[#0A7A6E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">End Date *</label>
              <input type="date" value={manualEndDate} onChange={(e) => setManualEndDate(e.target.value)} className="w-full px-4 py-4 bg-[#F8F7F5] rounded-xl border border-[#E5E5E5] text-[#1A1A1A] outline-none focus:border-[#0A7A6E]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Who's traveling?</label>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#F8F7F5] rounded-xl p-4">
                <div className="flex items-center gap-3"><Users className="w-5 h-5 text-[#0A7A6E]" /><span className="font-medium text-[#1A1A1A]">Adults</span></div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setManualAdults(Math.max(1, manualAdults - 1))} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] font-bold border border-[#E5E5E5]">-</button>
                  <span className="w-8 text-center font-bold text-[#1A1A1A]">{manualAdults}</span>
                  <button onClick={() => setManualAdults(manualAdults + 1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] font-bold border border-[#E5E5E5]">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#F8F7F5] rounded-xl p-4">
                <div className="flex items-center gap-3"><Baby className="w-5 h-5 text-[#0A7A6E]" /><span className="font-medium text-[#1A1A1A]">Kids</span></div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setManualKids(Math.max(0, manualKids - 1))} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] font-bold border border-[#E5E5E5]">-</button>
                  <span className="w-8 text-center font-bold text-[#1A1A1A]">{manualKids}</span>
                  <button onClick={() => setManualKids(manualKids + 1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] font-bold border border-[#E5E5E5]">+</button>
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleManualSubmit} className="w-full bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold mt-4">Continue</button>
        </div>
      </div>
    );
  }

  if (step === 'kids-age') {
    return (
      <div className="min-h-screen bg-white">
        <header className="px-5 pt-12 pb-4 flex items-center gap-4">
          <button onClick={() => setStep('manual-input')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-[#1A1A1A]" /></button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Kids Details</h1>
        </header>
        <div className="px-5 py-6">
          <div className="bg-[#F0FDFA] rounded-2xl p-4 mb-6"><p className="text-[#0A7A6E] font-medium">We'll customize packing lists based on your kids' ages!</p></div>
          <div className="space-y-4">
            {Array(numKids).fill(0).map((_, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Kid {index + 1} age</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((age) => (
                    <button key={age} onClick={() => { const newAges = [...kidAges]; newAges[index] = age; setKidAges(newAges); }} className={`flex-shrink-0 w-12 h-12 rounded-xl font-semibold ${kidAges[index] === age ? 'bg-[#0A7A6E] text-white' : 'bg-[#F8F7F5] text-[#1A1A1A]'}`}>{age}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleKidAgesSubmit} className="w-full bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold mt-8">Continue</button>
        </div>
      </div>
    );
  }

  if (step === 'preview' && tripData) {
    const duration = Math.ceil((new Date(tripData.end_date).getTime() - new Date(tripData.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return (
      <div className="min-h-screen bg-white">
        <div className="relative h-64">
          <img src={getDestinationImage(tripData.destination)} alt={tripData.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 overlay-gradient" />
          <button onClick={() => router.push('/')} className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div className="absolute bottom-4 left-5 right-5">
            <h1 className="text-white font-bold text-3xl">{tripData.destination}</h1>
            {tripData.country && <p className="text-white/80">{tripData.country}</p>}
          </div>
        </div>
        <div className="px-5 py-6 space-y-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Trip Preview</h2>
          <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-4 border-b border-[#F0F0F0]">
              <Calendar className="w-5 h-5 text-[#0A7A6E]" />
              <div><p className="font-medium text-[#1A1A1A]">{new Date(tripData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tripData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="text-sm text-[#6B6B6B]">{duration} days</p></div>
            </div>
            <div className="flex items-center gap-4 px-4 py-4 border-b border-[#F0F0F0]"><Users className="w-5 h-5 text-[#0A7A6E]" /><p className="font-medium text-[#1A1A1A]">{tripData.num_adults} Adults</p></div>
            {tripData.num_kids > 0 && (
              <div className="flex items-center gap-4 px-4 py-4"><Baby className="w-5 h-5 text-[#0A7A6E]" /><div><p className="font-medium text-[#1A1A1A]">{tripData.num_kids} Kid{tripData.num_kids > 1 ? 's' : ''}</p>{tripData.kid_ages?.length > 0 && <p className="text-sm text-[#6B6B6B]">Ages: {tripData.kid_ages.join(', ')} years</p>}</div></div>
            )}
          </div>
          <button onClick={handlePreviewConfirm} className="w-full bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold">Generate Packing List</button>
        </div>
      </div>
    );
  }

  if (step === 'packing') {
    const kidsItems = packingList.filter(i => i.category === 'kids');
    const adultsItems = packingList.filter(i => i.category === 'adults');
    if (packingList.length === 0) {
      return <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5"><Loader2 className="w-12 h-12 text-[#0A7A6E] animate-spin mb-4" /><h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Generating Packing List...</h2><p className="text-[#6B6B6B]">Customizing for your family</p></div>;
    }
    return (
      <div className="min-h-screen bg-white pb-32">
        <header className="px-5 pt-12 pb-4 flex items-center gap-4">
          <button onClick={() => setStep('preview')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-[#1A1A1A]" /></button>
          <div><h1 className="text-xl font-bold text-[#1A1A1A]">Packing List</h1><p className="text-sm text-[#6B6B6B]">AI-generated for your trip</p></div>
        </header>
        <div className="px-5">
          {kidsItems.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Baby className="w-5 h-5 text-[#0A7A6E]" />For Kids ({kidsItems.length} items)</h3>
              <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
                {kidsItems.slice(0,5).map((item, i) => (<div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i < Math.min(kidsItems.length, 5) - 1 ? 'border-b border-[#F0F0F0]' : ''}`}><div className="w-5 h-5 rounded-md border-2 border-[#0A7A6E] flex items-center justify-center"><Check className="w-3 h-3 text-[#0A7A6E]" /></div><span className="text-[#1A1A1A]">{item.text}</span></div>))}
                {kidsItems.length > 5 && <div className="px-4 py-3 bg-[#F8F7F5] text-center text-sm text-[#6B6B6B]">+{kidsItems.length - 5} more items</div>}
              </div>
            </div>
          )}
          <div className="mb-6">
            <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-[#0A7A6E]" />For Adults ({adultsItems.length} items)</h3>
            <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
              {adultsItems.slice(0,5).map((item, i) => (<div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i < Math.min(adultsItems.length, 5) - 1 ? 'border-b border-[#F0F0F0]' : ''}`}><div className="w-5 h-5 rounded-md border-2 border-[#0A7A6E] flex items-center justify-center"><Check className="w-3 h-3 text-[#0A7A6E]" /></div><span className="text-[#1A1A1A]">{item.text}</span></div>))}
              {adultsItems.length > 5 && <div className="px-4 py-3 bg-[#F8F7F5] text-center text-sm text-[#6B6B6B]">+{adultsItems.length - 5} more items</div>}
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F0F0F0]">
          <button onClick={handlePackingContinue} className="w-full bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold">{isLoggedIn ? 'Save Trip' : 'Sign Up to Save Trip'}</button>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-5 pt-12 pb-4 flex items-center gap-4"><button onClick={() => setStep('packing')} className="w-10 h-10 bg-[#F8F7F5] rounded-full flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-[#1A1A1A]" /></button></header>
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-20 h-20 bg-[#F0FDFA] rounded-full flex items-center justify-center mb-6"><Sparkles className="w-10 h-10 text-[#0A7A6E]" /></div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 text-center">Save Your Trip</h2>
          <p className="text-[#6B6B6B] text-center mb-8">Sign up to save your trip and access your packing list anytime</p>
          <button onClick={handleLoginClick} className="w-full bg-[#0A7A6E] text-white py-4 rounded-xl font-semibold mb-4">Sign Up / Login</button>
          <button onClick={() => router.push('/')} className="text-[#6B6B6B] font-medium">Maybe Later</button>
        </div>
      </div>
    );
  }

  if (step === 'saving') {
    return <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5"><Loader2 className="w-12 h-12 text-[#0A7A6E] animate-spin mb-4" /><h2 className="text-xl font-bold text-[#1A1A1A]">Saving your trip...</h2></div>;
  }

  return null;
}

export default function TripCreationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#0A7A6E] animate-spin" /></div>}>
      <TripCreationContent />
    </Suspense>
  );
}
