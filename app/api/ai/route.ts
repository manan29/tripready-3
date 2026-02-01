import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback: Parse with simple regex if no API key
      return NextResponse.json(parseWithRegex(input))
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const today = new Date()
    const defaultStartDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract trip details from this text: "${input}"

Today's date is ${today.toISOString().split('T')[0]}.

Return ONLY valid JSON (no markdown, no explanation):
{
  "destination": "string (country or city name)",
  "duration_days": number (default 7 if not specified),
  "start_date": "YYYY-MM-DD" (use context clues like "March" or "next month", default to 30 days from today),
  "adults": number (default 2),
  "kids": number (default 1 if mentions kids/children/family, otherwise 0),
  "kid_ages": [array of numbers] (estimate from context: "toddler"=2, "infant"=1, "baby"=1, "teenager"=14, default [3]),
  "budget": number or null (parse "2 lakhs" as 200000, "1.5L" as 150000),
  "currency": "INR"
}

If destination cannot be determined, return: {"error": "destination_required"}`
        }
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Clean up the response - remove any markdown formatting
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(cleanedResponse)

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    // Calculate end_date
    const startDate = new Date(parsed.start_date)
    const endDate = new Date(startDate.getTime() + (parsed.duration_days - 1) * 24 * 60 * 60 * 1000)

    return NextResponse.json({
      destination: parsed.destination,
      start_date: parsed.start_date,
      end_date: endDate.toISOString().split('T')[0],
      adults: parsed.adults,
      kids: parsed.kids,
      kid_ages: parsed.kid_ages,
      budget: parsed.budget,
      currency: parsed.currency || 'INR',
    })
  } catch (error) {
    console.error('AI parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse trip details' },
      { status: 500 }
    )
  }
}

// Fallback regex parser when no API key
function parseWithRegex(input: string) {
  const lowerInput = input.toLowerCase()

  // Extract destination (first capitalized word or known destinations)
  const destinations = ['thailand', 'singapore', 'dubai', 'bali', 'maldives', 'goa', 'paris', 'london', 'tokyo', 'sydney', 'new york', 'switzerland', 'malaysia', 'vietnam', 'sri lanka', 'nepal', 'bhutan']
  let destination = ''
  for (const dest of destinations) {
    if (lowerInput.includes(dest)) {
      destination = dest.charAt(0).toUpperCase() + dest.slice(1)
      break
    }
  }

  if (!destination) {
    // Try to get first capitalized word
    const words = input.split(' ')
    for (const word of words) {
      if (word[0] === word[0].toUpperCase() && word.length > 2) {
        destination = word.replace(/[^a-zA-Z]/g, '')
        break
      }
    }
  }

  if (!destination) {
    return { error: 'destination_required' }
  }

  // Extract duration
  const durationMatch = lowerInput.match(/(\d+)\s*(day|days|week|weeks)/)
  let duration = 7
  if (durationMatch) {
    duration = parseInt(durationMatch[1])
    if (durationMatch[2].includes('week')) {
      duration *= 7
    }
  }

  // Extract kids
  const kidsMatch = lowerInput.match(/(\d+)\s*(kid|kids|child|children)/)
  let kids = 0
  if (kidsMatch) {
    kids = parseInt(kidsMatch[1])
  } else if (lowerInput.includes('kid') || lowerInput.includes('child') || lowerInput.includes('family') || lowerInput.includes('toddler') || lowerInput.includes('baby')) {
    kids = 1
  }

  // Extract budget
  let budget = null
  const budgetMatch = lowerInput.match(/(\d+\.?\d*)\s*(lakh|lakhs|l\b|lac)/i)
  if (budgetMatch) {
    budget = parseFloat(budgetMatch[1]) * 100000
  }

  // Calculate dates
  const today = new Date()
  const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const endDate = new Date(startDate.getTime() + (duration - 1) * 24 * 60 * 60 * 1000)

  return {
    destination,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    adults: 2,
    kids,
    kid_ages: kids > 0 ? Array(kids).fill(3) : [],
    budget,
    currency: 'INR',
  }
}
