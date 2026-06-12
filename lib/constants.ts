// Shared constants. No auth in this pilot — every action runs as the seeded
// demo user. Swap DEMO_PROFILE_ID for auth.uid() when sign-in lands.
export const DEMO_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

export const LISTING_TYPES = ['Alle', 'Bod', 'Garasje', 'Loft', 'Container', 'Industri'] as const;

// kr/m²-ish rate used by the host income calculator (per design).
export const HOST_RATES: Record<string, number> = {
  Bod: 96, Garasje: 80, Loft: 64, Container: 92, Industri: 74,
};
