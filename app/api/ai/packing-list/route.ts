import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { destination, duration, numKids, kidAges, weather } = await request.json();

    console.log('Generating packing list:', { destination, duration, numKids, kidAges });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate packing list for Indian family going to ${destination}.
Duration: ${duration} days, Kids: ${numKids}, Ages: ${kidAges?.join(', ') || 'none'}, Weather: ${weather || 'check forecast'}

Return ONLY valid JSON:
{
  "kids_items": [
    { "category": "Medicines", "items": ["Calpol", "Electral", "Band-aids"] },
    { "category": "Clothes", "items": ["Cotton t-shirts", "Sun hat"] },
    { "category": "Entertainment", "items": ["Coloring books", "Tablet"] },
    { "category": "Essentials", "items": ["Sippy cup", "Snacks"] }
  ],
  "general_items": [
    { "category": "Clothes", "items": ["T-shirts", "Shorts"] },
    { "category": "Toiletries", "items": ["Sunscreen", "Toothbrush"] },
    { "category": "Electronics", "items": ["Charger", "Power bank"] },
    { "category": "Documents", "items": ["Passport", "Visa"] }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleaned = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const packingList = JSON.parse(cleaned);

    return NextResponse.json(packingList);

  } catch (error) {
    console.error('Packing list error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
