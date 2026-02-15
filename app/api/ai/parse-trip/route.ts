import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Parse this travel query and extract trip details. Return ONLY valid JSON, no other text.

Query: "${query}"

Extract:
- destination (city name)
- country
- duration (number of days, default 5 if not specified)
- startDate (if mentioned, otherwise null)
- endDate (if mentioned, otherwise null)
- numAdults (default 2)
- numKids (default 0)
- tripType (luxury/budget/family/beach/adventure - infer from context)

Return JSON format:
{
  "destination": "Dubai",
  "country": "UAE",
  "duration": 5,
  "startDate": null,
  "endDate": null,
  "numAdults": 2,
  "numKids": 0,
  "tripType": "luxury"
}`,
        },
      ],
    })

    // Parse the response
    const content = message.content[0]
    if (content.type === 'text') {
      try {
        const parsed = JSON.parse(content.text)
        return NextResponse.json(parsed)
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        return NextResponse.json(
          { error: 'Failed to parse AI response' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 })
  } catch (error) {
    console.error('AI parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to process trip query' },
      { status: 500 }
    )
  }
}
