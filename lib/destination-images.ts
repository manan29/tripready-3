export const DESTINATION_IMAGES: Record<string, string> = {
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
  'thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
  'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
  'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
  'malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop',
  'vietnam': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
};

export function getDestinationImage(destination: string): string {
  const key = destination?.toLowerCase()?.trim() || '';
  return DESTINATION_IMAGES[key] || DESTINATION_IMAGES['default'];
}
