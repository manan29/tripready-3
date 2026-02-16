'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Users, Baby, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
  initialCountry?: string;
  onTripCreated: (tripData: any) => void;
}

export function CreateTripModal({
  isOpen,
  onClose,
  initialDestination = '',
  initialCountry = '',
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
      // Set default dates (next week)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const endDateDefault = new Date(nextWeek);
      endDateDefault.setDate(endDateDefault.getDate() + 5);
      setStartDate(nextWeek.toISOString().split('T')[0]);
      setEndDate(endDateDefault.toISOString().split('T')[0]);
    }
  }, [isOpen, initialDestination, initialCountry]);

  const parseKidAges = (): number[] => {
    if (!kidAges.trim()) return [];
    return kidAges
      .split(',')
      .map((age) => parseInt(age.trim()))
      .filter((age) => !isNaN(age) && age >= 0 && age <= 18);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {step === 'form' ? (
          <div className="p-6">
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

              {/* Adults */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Adults
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numAdults}
                  onChange={(e) => setNumAdults(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* Kids */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  Number of Kids
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={numKids}
                  onChange={(e) => setNumKids(parseInt(e.target.value) || 0)}
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

              {/* Generate Button */}
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
          </div>
        ) : (
          <div className="p-6">
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

            {/* Packing List Preview */}
            {packingList && packingList.categories && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Your Packing List</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {packingList.categories.slice(0, 3).map((cat: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3">
                      <p className="font-medium text-gray-900 text-sm mb-1">{cat.name}</p>
                      <p className="text-xs text-gray-600">
                        {cat.items.slice(0, 3).join(', ')}
                        {cat.items.length > 3 && ` +${cat.items.length - 3} more`}
                      </p>
                    </div>
                  ))}
                  {packingList.categories.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{packingList.categories.length - 3} more categories
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
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
        )}
      </div>
    </div>
  );
}
