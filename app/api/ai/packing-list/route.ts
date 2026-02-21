import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, startDate, endDate, numKids, kidAges, numAdults } = body;

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Get month for seasonal items
    const month = start.toLocaleString('en-US', { month: 'long' });

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Generate Kids Packing List
    const kidsPrompt = `Generate a comprehensive packing list for ${numKids} kid(s) aged ${kidAges.join(', ')} years old traveling to ${destination} for ${days} days in ${month}.

Include:
- Age-appropriate clothing
- Essential items for kids (diapers, formula, etc. if applicable)
- Entertainment (books, toys, tablets)
- Safety items
- Comfort items

Return ONLY a JSON array of strings, each string being one packing item. No explanations or markdown.
Example format: ["Item 1", "Item 2", "Item 3"]

Keep it practical and concise (max 20 items).`;

    const adultsPrompt = `Generate a comprehensive packing list for ${numAdults} adults traveling to ${destination} for ${days} days in ${month}.

Include:
- Clothing appropriate for the destination and weather
- Toiletries and personal care
- Travel documents and essentials
- Electronics and chargers
- Medications and first aid

Return ONLY a JSON array of strings, each string being one packing item. No explanations or markdown.
Example format: ["Item 1", "Item 2", "Item 3"]

Keep it practical and concise (max 20 items).`;

    // Generate both lists
    const [kidsResult, adultsResult] = await Promise.all([
      numKids > 0 ? model.generateContent(kidsPrompt) : Promise.resolve(null),
      model.generateContent(adultsPrompt),
    ]);

    let kidsItems: string[] = [];
    let adultsItems: string[] = [];

    // Parse Kids response
    if (kidsResult) {
      const kidsText = kidsResult.response.text();
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = kidsText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          kidsItems = JSON.parse(jsonMatch[0]);
        } else {
          kidsItems = JSON.parse(kidsText);
        }
      } catch (e) {
        console.error('Failed to parse kids items:', e);
        // Fallback: split by newlines
        kidsItems = kidsText
          .split('\n')
          .map(line => line.replace(/^[-*]\s*/, '').trim())
          .filter(line => line && !line.startsWith('[') && !line.startsWith(']'));
      }
    }

    // Parse Adults response
    const adultsText = adultsResult.response.text();
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = adultsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        adultsItems = JSON.parse(jsonMatch[0]);
      } else {
        adultsItems = JSON.parse(adultsText);
      }
    } catch (e) {
      console.error('Failed to parse adults items:', e);
      // Fallback: split by newlines
      adultsItems = adultsText
        .split('\n')
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line && !line.startsWith('[') && !line.startsWith(']'));
    }

    return NextResponse.json({
      kids: kidsItems,
      adults: adultsItems,
    });
  } catch (error) {
    console.error('Error generating packing list:', error);
    return NextResponse.json(
      { error: 'Failed to generate packing list' },
      { status: 500 }
    );
  }
}
