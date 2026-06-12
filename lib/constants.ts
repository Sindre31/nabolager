// Shared constants.
export const LISTING_TYPES = ['Alle', 'Bod', 'Garasje', 'Loft', 'Container', 'Industri'] as const;

// kr/m²-ish rate used by the host income calculator (per design).
export const HOST_RATES: Record<string, number> = {
  Bod: 96, Garasje: 80, Loft: 64, Container: 92, Industri: 74,
};
