import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const prompt = `Parse this travel query and extract trip details: "${query}"

Today's date is ${today.toISOString().split('T')[0]}.

Extract:
- destination: The city or country (e.g., "Dubai", "Singapore", "Bali")
- country: The country name
- duration: Number of days (default 5 if not specified)
- start_date: In YYYY-MM-DD format (default to next week if not specified)
- end_date: In YYYY-MM-DD format
- num_adults: Number of adults (default 2)
- num_kids: Number of children (look for "kids", "children", "toddler", "baby", "infant")
- kid_ages: Array of ages if mentioned (e.g., [3, 6])

Return ONLY a JSON object like this:
{
  "destination": "Dubai",
  "country": "UAE",
  "duration": 5,
  "start_date": "${nextWeek.toISOString().split('T')[0]}",
  "end_date": "2026-03-01",
  "num_adults": 2,
  "num_kids": 1,
  "kid_ages": [3],
  "parsed_successfully": true
}

If you can't parse it, return:
{
  "parsed_successfully": false,
  "error": "Could not understand the query"
}

Return ONLY the JSON, no other text.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        parsed_successfully: false,
        error: 'Could not parse response',
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Parse trip error:', error);
    return NextResponse.json(
      { parsed_successfully: false, error: 'Failed to parse trip' },
      { status: 500 }
    );
  }
}
