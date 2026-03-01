import { NextResponse } from 'next/server';

const FALLBACK_IMAGES: Record<string, string> = {
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'Vietnam': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&q=80',
  'Sri Lanka': 'https://images.unsplash.com/photo-1586613835341-bd7d6a513837?w=800&q=80',
  'Oman': 'https://images.unsplash.com/photo-1559592306-a79e78b57e57?w=800&q=80',
  'Georgia': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80',
  'Azerbaijan': 'https://images.unsplash.com/photo-1603204077167-2fa0397f858e?w=800&q=80',
  'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  'Mauritius': 'https://images.unsplash.com/photo-1585496029566-2f4f5c9b23db?w=800&q=80',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || 'Dubai';

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  // Try Unsplash first
  if (accessKey) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination + ' travel landmark')}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return NextResponse.json({
          url: photo.urls.regular,
          thumb: photo.urls.small,
          credit: photo.user.name,
          creditLink: photo.user.links.html,
        });
      }
    } catch (error) {
      console.error('Unsplash API error:', error);
    }
  }

  // Fallback to static images
  const fallbackUrl = FALLBACK_IMAGES[destination] || FALLBACK_IMAGES['Dubai'];

  return NextResponse.json({
    url: fallbackUrl,
    thumb: fallbackUrl,
    credit: 'Unsplash',
    creditLink: 'https://unsplash.com',
  });
}
