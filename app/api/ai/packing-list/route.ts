import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { destination, duration, numAdults, numKids, weather } = await request.json()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate a packing list for a trip with these details:
- Destination: ${destination}
- Duration: ${duration} days
- Adults: ${numAdults}
- Kids: ${numKids}
- Weather: ${weather || 'unknown'}

Return ONLY valid JSON with items grouped by category. Each item has a title.

Categories: Clothes, Medicines, Electronics, Toiletries${numKids > 0 ? ', Kids Items' : ''}, Documents

Format:
{
  "categories": [
    {
      "name": "Clothes",
      "items": ["T-shirts (${Math.ceil(duration * 1.2)} pieces)", "Pants/Shorts (${Math.ceil(duration / 2)} pieces)", "Underwear (${duration + 2} pieces)", "Sleepwear", "Comfortable walking shoes", "Sandals/flip-flops"]
    },
    {
      "name": "Documents",
      "items": ["Passport", "Visa (if required)", "Travel insurance", "Flight tickets", "Hotel bookings", "Emergency contacts"]
    }
  ]
}

Be practical and specific to the destination and weather. Include quantities where helpful. For ${duration} days trip, calculate appropriate quantities.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      try {
        const parsed = JSON.parse(content.text)
        return NextResponse.json(parsed)
      } catch (parseError) {
        console.error('Failed to parse packing list:', parseError)
        return NextResponse.json(
          { error: 'Failed to parse packing list' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 })
  } catch (error) {
    console.error('Packing list generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate packing list' },
      { status: 500 }
    )
  }
}
