import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        {
          parsed_successfully: false,
          error: 'API configuration error',
          details: 'ANTHROPIC_API_KEY not configured',
        },
        { status: 500 }
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { parsed_successfully: false, error: 'Query is required' },
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

    const prompt = `Parse this travel query and extract trip details: "${query}"

Today's date is ${today.toISOString().split('T')[0]}.

Extract:
- destination: The city or country (e.g., "Dubai", "Singapore", "Bali")
- country: The country name
- duration: Number of days (default 5 if not specified)
- start_date: In YYYY-MM-DD format (default to next week if not specified)
- end_date: In YYYY-MM-DD format (calculate from start_date + duration)
- num_adults: Number of adults (default 2)
- num_kids: Number of children (look for "kids", "children", "toddler", "baby", "infant")
- kid_ages: Array of ages if mentioned (e.g., [3, 6])

Return ONLY a JSON object like this:
{
  "destination": "Dubai",
  "country": "UAE",
  "duration": 5,
  "start_date": "${nextWeek.toISOString().split('T')[0]}",
  "end_date": "${endDate.toISOString().split('T')[0]}",
  "num_adults": 2,
  "num_kids": 1,
  "kid_ages": [3],
  "parsed_successfully": true
}

Return ONLY the JSON, no other text.`;

    // Call Anthropic API
    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });
    } catch (apiError: any) {
      console.error('Anthropic API error:', apiError);
      return NextResponse.json(
        {
          parsed_successfully: false,
          error: 'AI service error',
          details: apiError.message || 'Failed to call AI service',
        },
        { status: 500 }
      );
    }

    // Extract text from response
    if (!message.content || message.content.length === 0) {
      console.error('Empty AI response');
      return NextResponse.json({
        parsed_successfully: false,
        error: 'Empty AI response',
        details: 'The AI did not return any content',
      });
    }

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('AI Response:', responseText);

    if (!responseText) {
      console.error('No text in AI response');
      return NextResponse.json({
        parsed_successfully: false,
        error: 'Invalid AI response',
        details: 'No text content in AI response',
      });
    }

    // Try to parse JSON from response
    let parsed;
    try {
      // First try direct parse
      parsed = JSON.parse(responseText);
    } catch (e) {
      // If that fails, try to extract JSON using regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', responseText);
        return NextResponse.json({
          parsed_successfully: false,
          error: 'Could not parse AI response',
          details: 'No valid JSON found in response',
        });
      }

      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError: any) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json({
          parsed_successfully: false,
          error: 'Invalid JSON in AI response',
          details: parseError.message,
        });
      }
    }

    console.log('Parsed data:', parsed);

    // Ensure parsed_successfully flag is set
    if (parsed.parsed_successfully === undefined) {
      parsed.parsed_successfully = true;
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Parse trip error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        parsed_successfully: false,
        error: 'Failed to parse trip',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
