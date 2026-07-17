import { z } from 'zod';

export const HOTEL_SEARCH_PARTNERS = ['Stayfinder', 'BookNest', 'InnRoute'] as const;
export type HotelSearchPartner = (typeof HOTEL_SEARCH_PARTNERS)[number];

export const hotelSearchQuerySchema = z.object({
  location: z.string().trim().min(1).max(200),
  checkIn: z.string().max(20).optional(),
  checkOut: z.string().max(20).optional(),
  guests: z.coerce.number().int().min(1).max(20).default(1),
});
export type HotelSearchQuery = z.infer<typeof hotelSearchQuerySchema>;

export const hotelPartnerPriceSchema = z.object({
  partner: z.enum(HOTEL_SEARCH_PARTNERS),
  price: z.number(),
  url: z.string(),
});
export type HotelPartnerPrice = z.infer<typeof hotelPartnerPriceSchema>;

export const hotelResultSchema = z.object({
  name: z.string(),
  area: z.string(),
  rating: z.number(),
  type: z.string(),
  imageUrl: z.string().optional(),
  pricePerNight: z.number(),
  nights: z.number(),
  currency: z.literal('EUR'),
  partnerPrices: z.array(hotelPartnerPriceSchema),
});
export type HotelResult = z.infer<typeof hotelResultSchema>;

export const hotelSearchResponseSchema = z.object({
  results: z.array(hotelResultSchema),
});
export type HotelSearchResponse = z.infer<typeof hotelSearchResponseSchema>;
