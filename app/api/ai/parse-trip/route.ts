import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured', parsed_successfully: false },
        { status: 500 }
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required', parsed_successfully: false },
        { status: 400 }
      );
    }

    console.log('Parsing query with Gemini:', query);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000);

    const prompt = `Parse this travel query: "${query}"

Today is ${today.toISOString().split('T')[0]}.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation):
{
  "destination": "city name",
  "country": "country name",
  "duration": 5,
  "start_date": "${nextWeek.toISOString().split('T')[0]}",
  "end_date": "${endDate.toISOString().split('T')[0]}",
  "num_adults": 2,
  "num_kids": 0,
  "kid_ages": [],
  "parsed_successfully": true
}

Rules:
- Extract destination city from query
- Guess the country based on city
- Look for "kids", "children", "toddler", "baby" to set num_kids
- Extract ages if mentioned like "3 year old" or "2 kids (3 and 6)"
- Return ONLY the JSON object, nothing else`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('Gemini response:', responseText);

    // Clean response
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Parse trip error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', parsed_successfully: false },
      { status: 500 }
    );
  }
}
