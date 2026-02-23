import { NextResponse } from 'next/server';

const CURRENCY_MAP: Record<string, { code: string; name: string; symbol: string }> = {
  'maldives': { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  'dubai': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  'uae': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  'singapore': { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  'thailand': { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  'bali': { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  'indonesia': { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  'malaysia': { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  'japan': { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  'usa': { code: 'USD', name: 'US Dollar', symbol: '$' },
  'uk': { code: 'GBP', name: 'British Pound', symbol: '£' },
  'europe': { code: 'EUR', name: 'Euro', symbol: '€' },
  'australia': { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || 'Maldives';
  const amount = parseFloat(searchParams.get('amount') || '1000');

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Currency API key not configured' }, { status: 500 });
  }

  try {
    let currencyInfo = { code: 'USD', name: 'US Dollar', symbol: '$' };
    for (const [place, info] of Object.entries(CURRENCY_MAP)) {
      if (destination.toLowerCase().includes(place)) {
        currencyInfo = info;
        break;
      }
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`
    );
    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('Exchange rate API failed');
    }

    const rate = data.conversion_rates[currencyInfo.code] || 1;

    return NextResponse.json({
      from: 'INR',
      to: currencyInfo.code,
      toName: currencyInfo.name,
      toSymbol: currencyInfo.symbol,
      rate: rate,
      converted: amount * rate,
      lastUpdated: data.time_last_update_utc,
    });

  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json({
      from: 'INR',
      to: 'USD',
      toName: 'US Dollar',
      toSymbol: '$',
      rate: 0.012,
      converted: amount * 0.012,
      error: 'Using fallback rate'
    });
  }
}
