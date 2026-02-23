import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      freeform_query,
      start_date,
      duration,
      adults,
      kids,
      kid_details,
      health_notes,
      hotel_rating,
      amenities,
      airlines,
      destination,
      suggest_destination
    } = body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a travel planning AI for Indian families. Plan a trip based on these details:

TRIP REQUEST:
- Query: "${freeform_query || 'Family vacation'}"
- Start Date: ${start_date}
- Duration: ${duration} days
- Adults: ${adults}
- Kids: ${kids}
- Kid Details: ${JSON.stringify(kid_details || [])}
- Health Concerns: ${health_notes || 'None specified'}

PREFERENCES:
- Hotel Rating: ${hotel_rating || 4} star
- Must-have Amenities: ${(amenities || []).join(', ') || 'Pool'}
- Preferred Airlines: ${(airlines || []).join(', ') || 'Any'}
- Destination: ${suggest_destination ? 'SUGGEST BEST OPTIONS' : destination}

${suggest_destination ? `
IMPORTANT: Suggest 3 best destinations considering:
1. Health concerns mentioned (especially for kids)
2. Time of year (${start_date})
3. Family-friendly activities
4. Flight accessibility from India
` : ''}

Respond ONLY with valid JSON in this exact format:
{
  "suggested_destinations": ${suggest_destination ? '[{"name": "...", "country": "...", "why_perfect": "...", "health_score": 1-10, "kid_friendly_score": 1-10}]' : 'null'},
  "selected_destination": {
    "name": "${destination || '...'}",
    "country": "...",
    "why_chosen": "..."
  },
  "flight_recommendation": {
    "airline": "...",
    "flight_number": "...",
    "departure_time": "...",
    "arrival_time": "...",
    "price_per_person": ...,
    "total_price": ...,
    "why_recommended": "..."
  },
  "hotel_recommendation": {
    "name": "...",
    "rating": ...,
    "price_per_night": ...,
    "total_price": ...,
    "amenities": ["..."],
    "why_recommended": "...",
    "health_features": "..."
  },
  "health_specific_tips": [
    "..."
  ],
  "packing_list": {
    "priority_items": [
      {"item": "...", "reason": "...", "category": "medical"}
    ],
    "kids_items": [
      {"item": "...", "for_age": ..., "category": "..."}
    ],
    "adult_items": [
      {"item": "...", "category": "..."}
    ]
  },
  "estimated_budget": {
    "flights": ...,
    "hotel": ...,
    "food_estimate": ...,
    "activities_estimate": ...,
    "total": ...,
    "currency": "INR"
  },
  "destination_info": {
    "weather": "...",
    "currency": "...",
    "currency_rate": ...,
    "time_difference": "...",
    "visa_info": "...",
    "emergency_contacts": {
      "police": "...",
      "ambulance": "...",
      "indian_embassy": "..."
    }
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const tripPlan = JSON.parse(jsonMatch[0]);

    return NextResponse.json(tripPlan);

  } catch (error) {
    console.error('Plan trip error:', error);

    return NextResponse.json({
      error: 'Failed to plan trip',
      fallback: getFallbackPlan()
    }, { status: 500 });
  }
}

function getFallbackPlan() {
  return {
    selected_destination: { name: 'Maldives', country: 'Maldives', why_chosen: 'Clean air, family-friendly' },
    flight_recommendation: { airline: 'Emirates', price_per_person: 42000, total_price: 126000 },
    hotel_recommendation: { name: 'Family Resort', rating: 4, price_per_night: 25000 },
    health_specific_tips: ['Carry allergy medication', 'Request HEPA filter room'],
    packing_list: {
      priority_items: [{ item: 'Allergy medication', reason: 'Health', category: 'medical' }],
      kids_items: [{ item: 'Sunscreen SPF 50', for_age: 5, category: 'essentials' }],
      adult_items: [{ item: 'Passport', category: 'documents' }]
    },
    estimated_budget: { total: 300000, currency: 'INR' }
  };
}
