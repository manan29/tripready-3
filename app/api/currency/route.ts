import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'USD'
    const to = searchParams.get('to') || 'INR'

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${from}/${to}`
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch currency data' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.result !== 'success') {
      return NextResponse.json(
        { error: 'Invalid currency conversion' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      from,
      to,
      rate: data.conversion_rate,
    })
  } catch (error) {
    console.error('Currency API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch currency data' },
      { status: 500 }
    )
  }
}
