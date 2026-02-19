'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Users, Baby, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
  initialCountry?: string;
  initialNumKids?: number;
  initialKidAges?: number[];
  initialStartDate?: string;
  initialEndDate?: string;
  initialNumAdults?: number;
  onTripCreated: (tripData: any) => void;
}

export function CreateTripModal({
  isOpen,
  onClose,
  initialDestination = '',
  initialCountry = '',
  initialNumKids = 0,
  initialKidAges = [],
  initialStartDate = '',
  initialEndDate = '',
  initialNumAdults = 2,
  onTripCreated,
}: CreateTripModalProps) {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [destination, setDestination] = useState(initialDestination);
  const [country, setCountry] = useState(initialCountry);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numAdults, setNumAdults] = useState(2);
  const [numKids, setNumKids] = useState(1);
  const [kidAges, setKidAges] = useState('');

  // Preview data
  const [weather, setWeather] = useState<any>(null);
  const [packingList, setPackingList] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setDestination(initialDestination);
      setCountry(initialCountry);
      setNumKids(initialNumKids);
      setNumAdults(initialNumAdults);

      // Set kid ages from array
      if (initialKidAges && initialKidAges.length > 0) {
        setKidAges(initialKidAges.join(', '));
      } else {
        setKidAges('');
      }

      // Use provided dates or set default dates (next week)
      if (initialStartDate) {
        setStartDate(initialStartDate);
      } else {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setStartDate(nextWeek.toISOString().split('T')[0]);
      }

      if (initialEndDate) {
        setEndDate(initialEndDate);
      } else {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const endDateDefault = new Date(nextWeek);
        endDateDefault.setDate(endDateDefault.getDate() + 5);
        setEndDate(endDateDefault.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialDestination, initialCountry, initialNumKids, initialKidAges, initialStartDate, initialEndDate, initialNumAdults]);

  const parseKidAges = (): number[] => {
    if (!kidAges.trim()) return [];
    return kidAges
      .split(',')
      .map((age) => parseInt(age.trim()))
      .filter((age) => !isNaN(age) && age >= 0 && age <= 18);
  };

  // Auto-generate removed - user must click "Generate My Trip Preview" button

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    try {
      // Fetch weather
      const weatherRes = await fetch(`/api/weather?city=${destination}`);
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        setWeather(weatherData);
      }

      // Generate packing list
      const ages = parseKidAges();
      const duration = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const packingRes = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration,
          numAdults,
          numKids,
          kidAges: ages,
          weather: weather?.description || 'unknown',
        }),
      });

      if (packingRes.ok) {
        const packingData = await packingRes.json();
        setPackingList(packingData);
      }

      setStep('preview');
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate trip preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = () => {
    const tripData = {
      destination,
      country,
      startDate,
      endDate,
      numAdults,
      numKids,
      kidAges: parseKidAges(),
      weather,
      packingList,
    };
    onTripCreated(tripData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {step === 'form' ? (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Your Family Trip</h2>
              <p className="text-gray-600">Tell us about your trip and we'll create a personalized packing list</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>

              {/* Kids */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  Number of Kids
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numKids === 0 ? '' : numKids}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setNumKids(0);
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num) && num >= 0 && num <= 10) {
                        setNumKids(num);
                      }
                    }
                  }}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* Kids' Ages - THE MAGIC MOMENT */}
              {numKids > 0 && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-purple-900 mb-2">
                    ✨ Kids' Ages (This is the magic!)
                  </label>
                  <input
                    type="text"
                    value={kidAges}
                    onChange={(e) => setKidAges(e.target.value)}
                    placeholder="e.g., 3, 6 (separate with commas)"
                    className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                  />
                  <p className="text-xs text-purple-600 mt-2">
                    We'll generate age-specific packing lists for each child
                  </p>
                  {kidAges && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {parseKidAges().map((age, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {age} years old
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>

            {/* Sticky Button at Bottom */}
            <div className="shrink-0 border-t bg-white p-4">
              <button
                onClick={handleGeneratePreview}
                disabled={!destination || !startDate || !endDate || isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your trip...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate My Trip Preview
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Trip Preview</h2>
              <p className="text-gray-600">{destination} is ready!</p>
            </div>

            {/* Weather */}
            {weather && (
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Weather</p>
                <p className="text-2xl font-bold text-gray-900">
                  {weather.temp}°C {weather.description}
                </p>
              </div>
            )}

            {/* Kids Packing List Preview - THE MAGIC MOMENT! */}
            {packingList && numKids > 0 && packingList.kids_items && (
              <div className="mb-6">
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">✨</span>
                    <h3 className="font-bold text-purple-900 text-lg">What to pack for your kids:</h3>
                  </div>
                  <div className="space-y-3">
                    {packingList.kids_items.slice(0, 4).map((cat: any, idx: number) => {
                      const emojis: Record<string, string> = {
                        'Medicines': '💊',
                        'Clothes': '👕',
                        'Entertainment': '🎮',
                        'Essentials': '🍼',
                      };
                      return (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                          <p className="font-semibold text-purple-900 text-sm mb-1.5 flex items-center gap-2">
                            <span>{emojis[cat.category] || '📦'}</span>
                            {cat.category}
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {cat.items.slice(0, 4).join(', ')}
                            {cat.items.length > 4 && ` +${cat.items.length - 4} more`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-purple-600 text-center mt-3 font-medium">
                    Age-specific suggestions for {parseKidAges().join(', ')} year olds
                  </p>
                </div>

                {/* General Items Preview */}
                {packingList.general_items && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Also includes essentials for adults</p>
                    <div className="flex flex-wrap gap-2">
                      {packingList.general_items.slice(0, 3).map((cat: any, idx: number) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border border-gray-200">
                          {cat.category}
                        </span>
                      ))}
                      {packingList.general_items.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-500">
                          +{packingList.general_items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Packing List Preview (no kids) */}
            {packingList && numKids === 0 && packingList.general_items && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Your Packing List</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {packingList.general_items.slice(0, 4).map((cat: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3">
                      <p className="font-medium text-gray-900 text-sm mb-1">{cat.category}</p>
                      <p className="text-xs text-gray-600">
                        {cat.items.slice(0, 3).join(', ')}
                        {cat.items.length > 3 && ` +${cat.items.length - 3} more`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* Sticky Actions at Bottom */}
            <div className="shrink-0 border-t bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  ← Edit
                </button>
                <button
                  onClick={handleSaveTrip}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Save Trip
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
