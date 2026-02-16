export function generateWhatsAppShareText(trip: {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  numAdults: number;
  numKids: number;
  kidAges?: number[];
  packingProgress?: number;
  totalItems?: number;
}): string {
  const startDateFormatted = new Date(trip.startDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endDateFormatted = new Date(trip.endDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const kidsText = trip.numKids > 0
    ? `${trip.numKids} Kid${trip.numKids > 1 ? 's' : ''}${trip.kidAges?.length ? ` (${trip.kidAges.join(', ')} yrs)` : ''}`
    : '';

  const travelersText = `${trip.numAdults} Adult${trip.numAdults > 1 ? 's' : ''}${kidsText ? ', ' + kidsText : ''}`;

  let message = `🌴 *Our ${trip.destination} Trip*

📅 ${startDateFormatted} - ${endDateFormatted}
👨‍👩‍👧 ${travelersText}`;

  if (trip.packingProgress !== undefined && trip.totalItems) {
    message += `

✅ Packing: ${trip.packingProgress}% done (${trip.totalItems} items)`;
  }

  message += `

Plan your kids' trip: journeyai.app`;

  return message;
}

export function shareToWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
}
