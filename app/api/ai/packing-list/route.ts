import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDestinationByName } from '@/lib/destinations';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { destination, duration, numAdults, numKids, kidAges, weather } = await request.json();

    // Get destination info
    const destInfo = getDestinationByName(destination);
    const packingNotes = destInfo?.packingNotes || '';

    const prompt = `Generate a packing list for an Indian family traveling to ${destination}.

Trip Details:
- Duration: ${duration} days
- Adults: ${numAdults}
- Kids: ${numKids}
- Kids' ages: ${kidAges?.join(', ') || 'Not specified'}
- Weather: ${weather || destInfo?.weatherType || 'Check forecast'}
- Local tip: ${packingNotes}

IMPORTANT: Focus heavily on KIDS-SPECIFIC items based on their ages:

For INFANTS (0-1 year): diapers (Indian brands may not be available), formula, bottles, pacifiers, baby food, gripe water, Colicaid, baby carrier, portable crib sheet

For TODDLERS (1-3 years): pull-up diapers, Calpol/Meftal-P (not available in many countries), sippy cups, portable potty seat, favorite comfort toy/blanket, snack containers, child-safe sunscreen

For YOUNG KIDS (4-8 years): activity books, tablet with downloaded shows, kid-friendly sunscreen SPF 50+, swim floaties, comfortable walking shoes, favorite snacks from India

For PRE-TEENS (9-12 years): headphones, chargers, books/journal, own backpack

Return a JSON object with this exact structure:
{
  "categories": [
    {
      "name": "Kids Essentials",
      "items": ["item1", "item2"]
    },
    {
      "name": "Kids Medicines",
      "items": ["Calpol syrup", "Electral powder", "Band-aids"]
    },
    {
      "name": "Kids Clothes",
      "items": ["item1", "item2"]
    },
    {
      "name": "Kids Entertainment",
      "items": ["item1", "item2"]
    },
    {
      "name": "Adult Clothes",
      "items": ["item1", "item2"]
    },
    {
      "name": "Toiletries",
      "items": ["item1", "item2"]
    },
    {
      "name": "Electronics",
      "items": ["item1", "item2"]
    },
    {
      "name": "Documents",
      "items": ["item1", "item2"]
    }
  ]
}

Make items specific to the destination and weather. Include Indian-specific items that may not be available abroad.
Return ONLY the JSON, no other text.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean response
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const packingList = JSON.parse(cleaned);

    return NextResponse.json(packingList);
  } catch (error) {
    console.error('Packing list error:', error);
    return NextResponse.json(
      { error: 'Failed to generate packing list' },
      { status: 500 }
    );
  }
}
