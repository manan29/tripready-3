import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log('Received query:', query)

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Parse this travel query and extract trip details. Return ONLY valid JSON with no markdown formatting, no backticks, no code blocks, just pure JSON.

Query: "${query}"

You must extract:
- destination: The FULL city name (e.g., "Dubai", "Singapore", "Bangkok", "New York") - extract the complete city name, not abbreviations
- country: The country name (e.g., "UAE", "Singapore", "Thailand", "USA")
- duration: Number of days as integer (default to 5 if not specified)
- startDate: Date if mentioned (YYYY-MM-DD format), otherwise null
- endDate: Date if mentioned (YYYY-MM-DD format), otherwise null
- numAdults: Number of adults as integer (default to 2)
- numKids: Number of kids as integer (default to 0)
- tripType: One of: "luxury", "budget", "family", "beach", "adventure" (infer from context)

IMPORTANT: Make sure "destination" contains the FULL city name, not just the first letter.

Example outputs:
- For "Dubai 5 days": {"destination":"Dubai","country":"UAE","duration":5,"startDate":null,"endDate":null,"numAdults":2,"numKids":0,"tripType":"luxury"}
- For "family trip to Singapore": {"destination":"Singapore","country":"Singapore","duration":5,"startDate":null,"endDate":null,"numAdults":2,"numKids":2,"tripType":"family"}
- For "Bangkok budget trip": {"destination":"Bangkok","country":"Thailand","duration":5,"startDate":null,"endDate":null,"numAdults":2,"numKids":0,"tripType":"budget"}

Now parse the query above and return ONLY the JSON object, no other text:`,
        },
      ],
    })

    // Parse the response
    const content = message.content[0]
    if (content.type === 'text') {
      console.log('AI raw response:', content.text)

      try {
        // Clean the response - remove markdown code blocks if present
        let jsonText = content.text.trim()

        // Remove markdown code blocks (```json ... ``` or ``` ... ```)
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json?\s*/g, '').replace(/```\s*$/g, '').trim()
        }

        console.log('Cleaned response:', jsonText)

        const parsed = JSON.parse(jsonText)

        console.log('Parsed data:', parsed)

        // Validate that destination is not empty or too short
        if (!parsed.destination || parsed.destination.length < 2) {
          console.error('Invalid destination:', parsed.destination)
          return NextResponse.json(
            { error: 'Could not extract valid destination from query' },
            { status: 400 }
          )
        }

        return NextResponse.json(parsed)
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        console.error('Raw text was:', content.text)
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
