import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      destination,
      start_date,
      duration,
      adults = 2,
      kids = 1,
      kid_ages = [5],
      health_conditions = '',
      airline = 'no_pref',
      hotel_rating = 4,
      amenities = [],
    } = body;

    const month = new Date(start_date).toLocaleDateString('en-US', { month: 'long' });
    const kidAgesStr = kid_ages.join(', ');

    const prompt = `You are a travel expert helping an Indian family plan a trip.

TRIP DETAILS:
- Destination: ${destination}
- Month: ${month}
- Duration: ${duration} days
- Travelers: ${adults} adults, ${kids} kid(s) aged ${kidAgesStr} years
- Health conditions: ${health_conditions || 'None specified'}
- Preferred airline: ${airline}
- Hotel preference: ${hotel_rating} star
- Must have: ${amenities.join(', ') || 'No specific requirements'}

Generate a JSON response with this EXACT structure (no markdown, no backticks, just pure JSON):

{
  "honest_take": {
    "weather_reality": "Be honest about the weather. If it's hot, say it's hot. Include actual temperature range expected.",
    "best_time_of_day": "When should they do outdoor activities?",
    "kid_friendliness": 5,
    "highlights": ["3-4 specific attractions good for kids of this age"],
    "warnings": ["Any honest warnings - crowds, heat, expenses, etc"]
  },
  "things_to_know": [
    "Current visa requirements and cost for Indians",
    "Any ongoing events, festivals, or issues during their travel dates",
    "Currency and payment tips",
    "Local transport advice",
    "Any cultural considerations"
  ],
  "packing_list": {
    "kids": [
      "Light cotton clothes (5-6 sets) - specify based on weather",
      "Comfortable walking shoes (malls/attractions involve lots of walking)",
      "Swimwear (2 sets) + swim floaties if needed for age",
      "Sun hat + UV protection sunglasses",
      "Reef-safe sunscreen SPF 50+",
      "Light jacket/cardigan (AC in malls is aggressive - often 18°C!)",
      "Favorite snacks from home (customs usually allows)",
      "Comfort toy/blanket for flights and sleep",
      "Kids headphones + tablet loaded with shows/games",
      "Refillable water bottle",
      "Basic medicines: Calpol/Crocin, ORS sachets, band-aids, Odomos",
      "Wet wipes & hand sanitizer (lots of them)",
      "Diapers/pull-ups if needed for age",
      "Stroller if child is young (check if destination is stroller-friendly)"
    ],
    "adults": [
      "Passport (minimum 6 months validity) + 2 photocopies",
      "Visa printout (color copy if required)",
      "Travel insurance documents (mandatory for some countries)",
      "Forex card loaded with local currency + some USD",
      "Power adapter (specify type for destination)",
      "Modest clothing for religious sites/malls if applicable",
      "Sunglasses + sunscreen",
      "Comfortable walking shoes (you'll walk 10,000+ steps daily)",
      "Light layers/cardigan for aggressive AC",
      "Prescription medicines + doctor's note (some countries require)",
      "Phone charger + power bank",
      "International driving license if planning to rent car"
    ],
    "indian_essentials": [
      "Hing/Asafoetida (almost impossible to find abroad)",
      "MTR/Haldiram ready-to-eat packets (hotel room backup)",
      "Maggi/instant noodles for kids",
      "Pickle/Achaar (comfort food)",
      "Chai powder + small electric kettle (most hotels allow)",
      "Namkeen snacks for transit and room",
      "Roasted makhana/dry snacks",
      "Thepla/khakhra if vegetarian family"
    ]
  }
}

IMPORTANT RULES:
1. Be SPECIFIC to ${destination} and the ${month} weather
2. Be HONEST - if it's hot season, say so
3. Include age-appropriate items for ${kidAgesStr} year old(s)
4. If there are health conditions mentioned, add relevant items
5. Things to know should include CURRENT information - visa costs, any events during ${month}
6. Return ONLY valid JSON, no markdown formatting`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response - remove markdown if present
    let cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanedText);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedText);
      // Return fallback
      return NextResponse.json(getFallbackPlan(destination, month, kid_ages));
    }

  } catch (error) {
    console.error('AI Plan Trip Error:', error);
    return NextResponse.json(getFallbackPlan('Dubai', 'March', [5]));
  }
}

function getFallbackPlan(destination: string, month: string, kidAges: number[]) {
  const kidAgesStr = kidAges.join(' & ');

  return {
    honest_take: {
      weather_reality: `${destination} in ${month}: Expect warm weather around 28-35°C. Mornings and evenings are pleasant, midday can be hot.`,
      best_time_of_day: "Best for outdoor activities: Before 10 AM and after 4 PM",
      kid_friendliness: 5,
      highlights: [
        "World-class malls with play areas",
        "Beautiful beaches (if coastal)",
        "Kid-friendly attractions",
        "Excellent medical facilities"
      ],
      warnings: [
        "Peak tourist season - expect crowds at popular spots",
        "AC in malls is very strong - carry a light jacket",
        "Midday sun is harsh - stay indoors 12-3 PM"
      ]
    },
    things_to_know: [
      `🛂 Visa: Check current requirements for Indians - typically e-visa available (₹5,000-8,000)`,
      `💱 Currency: Carry forex card + some local currency. UPI doesn't work abroad.`,
      `🚕 Transport: Uber/local ride apps work well. Pre-book airport transfers.`,
      `📱 SIM: Get local SIM at airport or use international roaming pack`,
      `🏥 Medical: Keep travel insurance handy. Note nearest hospital to hotel.`
    ],
    packing_list: {
      kids: [
        `Light cotton clothes (5-6 sets) - breathable fabrics for ${destination} weather`,
        "Comfortable walking shoes (you'll walk a LOT in malls/attractions)",
        "Swimwear (2 sets) + swim floaties/puddle jumper",
        "Sun hat + UV protection kids sunglasses",
        "Reef-safe sunscreen SPF 50+ (apply every 2 hours outdoors)",
        "Light jacket/hoodie (malls keep AC at 18-20°C!)",
        "Favorite snacks from India (Parle-G, chips, fruits)",
        "Comfort toy/blanket for flights and new hotel rooms",
        "Kids headphones + tablet with downloaded shows (Netflix offline)",
        "Refillable water bottle (stay hydrated!)",
        "Medicines: Calpol, ORS sachets, Digene, band-aids, Odomos",
        "Wet wipes & hand sanitizer (can't have too many)",
        kidAges.some(age => age < 3) ? "Diapers/pull-ups (enough for trip + buffer)" : "Extra underwear (accidents happen on trips)",
        kidAges.some(age => age < 4) ? "Foldable stroller (most places are stroller-friendly)" : "Small backpack for their own things"
      ],
      adults: [
        "Passport (6+ months validity from return date) + 2 photocopies",
        `${destination} visa printout (color, keep digital backup too)`,
        "Travel insurance document (keep policy number handy)",
        "Forex card + ₹10,000-15,000 worth local currency",
        "Universal power adapter (Type G for UK-style, Type C for Europe)",
        "Modest clothing (shoulders & knees covered for religious sites)",
        "Good sunglasses + SPF 30+ sunscreen",
        "Comfortable walking shoes (your feet will thank you)",
        "Light cardigan/jacket for aggressive AC everywhere",
        "All prescription medicines + doctor's prescription letter",
        "Phone charger + 10000mAh power bank",
        "Photocopy of all documents in a separate bag",
        "Small day backpack for outings",
        "Reusable shopping bags (plastic bags banned in many places)"
      ],
      indian_essentials: [
        "Hing (asafoetida) - impossible to find abroad, essential for dal",
        "MTR/Haldiram ready meals (3-4 packets - hotel room backup)",
        "Maggi/Yippee noodles (kids' comfort food when tired of outside food)",
        "Pickle/Achaar small bottle (tastes like home)",
        "Chai powder + instant premix sachets",
        "Namkeen (mixture, bhujia) for snacking",
        "Roasted makhana/fox nuts (healthy travel snack)",
        "Khakhra/Thepla if vegetarian (travels well, no refrigeration needed)",
        "Chyawanprash/health supplements if you take them",
        "Small electric kettle if hotel doesn't provide (check voltage)"
      ]
    }
  };
}
