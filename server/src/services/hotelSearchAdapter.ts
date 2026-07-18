/**
 * Provider-agnostic hotel/accommodation price-comparison adapter (#hotel-search
 * item 3). Deliberately separate from the advisory/inquiries flow — commission-
 * based, free to the user, neutral price sorting only, no personal-recommendation
 * logic. Partner names/prices are placeholders until real affiliate partners are
 * contracted (see README note in the design handoff).
 */
import type { HotelResult, HotelSearchQuery } from '@trek/shared';
import { HOTEL_SEARCH_PARTNERS } from '@trek/shared';

export interface HotelSearchAdapter {
  search(query: HotelSearchQuery): Promise<HotelResult[]>;
}

const MOCK_PROPERTIES = [
  { name: 'Casa Alfama', area: 'Alfama', rating: 4.7, type: 'Boutique guesthouse', base: 213 },
  { name: 'Chiado Terrace Apartments', area: 'Chiado', rating: 4.5, type: 'Apartment', base: 176 },
  { name: 'Baixa Riverside Inn', area: 'Baixa', rating: 4.3, type: 'Inn', base: 149 },
];

// Deterministic per-property partner price spread (placeholder data) — same
// property always shows the same relative spread across partners, but the
// chip order is never re-sorted by price, only style-highlighted.
function partnerPrices(base: number): HotelResult['partnerPrices'] {
  const deltas = [0, -15, 11];
  return HOTEL_SEARCH_PARTNERS.map((partner, i) => ({
    partner,
    price: Math.max(1, base + deltas[i % deltas.length]),
    url: '#',
  }));
}

export class PlaceholderHotelSearchAdapter implements HotelSearchAdapter {
  async search(_query: HotelSearchQuery): Promise<HotelResult[]> {
    const nights = 3;
    return MOCK_PROPERTIES.map((p) => ({
      name: p.name,
      area: p.area,
      rating: p.rating,
      type: p.type,
      pricePerNight: p.base,
      nights,
      currency: 'EUR' as const,
      partnerPrices: partnerPrices(p.base),
    }));
  }
}

// Swap for a real affiliate/aggregator API once a partner is contracted.
export function getHotelSearchAdapter(): HotelSearchAdapter {
  return new PlaceholderHotelSearchAdapter();
}
