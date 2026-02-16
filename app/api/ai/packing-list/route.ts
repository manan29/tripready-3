import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDestinationByName } from '@/lib/destinations';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const packingList = JSON.parse(jsonMatch[0]);

    return NextResponse.json(packingList);
  } catch (error) {
    console.error('Packing list error:', error);
    return NextResponse.json(
      { error: 'Failed to generate packing list' },
      { status: 500 }
    );
  }
}
