// Unsplash images for destinations
export function getDestinationImage(destination: string): string {
  const imageMap: Record<string, string> = {
    dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    thailand: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
    bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    japan: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
    paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  };

  const key = destination.toLowerCase().replace(/\s+/g, '');
  return imageMap[key] || imageMap.bali;
}
