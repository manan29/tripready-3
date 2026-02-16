import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('Parse-trip API called');

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured', parsed_successfully: false },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query } = body;

    console.log('Query received:', query);

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required', parsed_successfully: false },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000);

    console.log('Calling Anthropic API...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Parse this travel query: "${query}"

Today is ${today.toISOString().split('T')[0]}.

Return ONLY valid JSON (no markdown, no backticks):
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

Extract destination from query. Look for kids/children/toddler mentions. Return ONLY JSON.`
        }
      ],
    });

    console.log('Anthropic response received');

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean response
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Cleaned response:', cleaned);

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Parse trip error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        parsed_successfully: false
      },
      { status: 500 }
    );
  }
}
