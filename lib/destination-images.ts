const DESTINATION_IMAGES: Record<string, string> = {
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
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
};

export function getDestinationImage(destination: string): string {
  // Try exact match first
  if (DESTINATION_IMAGES[destination]) {
    return DESTINATION_IMAGES[destination];
  }

  // Try partial match (case insensitive)
  const lowerDest = destination.toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (lowerDest.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerDest)) {
      return url;
    }
  }

  return DESTINATION_IMAGES['default'];
}

export function getDestinationImageAsync(destination: string): Promise<string> {
  return fetch(`/api/images/destination?destination=${encodeURIComponent(destination)}`)
    .then(res => res.json())
    .then(data => data.url || getDestinationImage(destination))
    .catch(() => getDestinationImage(destination));
}
