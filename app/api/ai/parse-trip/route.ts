import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured', parsed_successfully: false },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required', parsed_successfully: false },
        { status: 400 }
      );
    }

    console.log('Parsing query:', query);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Parse this travel query and extract trip details: "${query}"

Today's date is ${today.toISOString().split('T')[0]}.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with these fields:
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
- destination: Extract the city/country from query
- duration: Default 5 days if not specified
- num_kids: Look for "kids", "children", "toddler", "baby"
- kid_ages: Extract ages if mentioned like "3 year old" or "2 kids (3 and 6)"
- Return ONLY the JSON, nothing else`
        }
      ],
    });

    console.log('Anthropic response received');

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Response text:', responseText);

    // Clean up response - remove markdown backticks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    const parsed = JSON.parse(cleanedResponse);
    console.log('Parsed result:', parsed);

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Parse trip error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage, parsed_successfully: false },
      { status: 500 }
    );
  }
}
