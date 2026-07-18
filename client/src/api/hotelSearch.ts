import apiClient from './client'
import type { AxiosResponse } from 'axios'
import type { HotelSearchResponse } from '@trek/shared'

/**
 * Axios calls for the affiliate hotel-search add-on. Named `hotelSearchApi`
 * (not `accommodationsApi`, which already exists in ./client.ts for TREK's
 * existing manual accommodation-reservation CRUD) to avoid confusion between
 * the two unrelated features.
 */
export const hotelSearchApi = {
  search: (params: { location: string; checkIn?: string; checkOut?: string; guests?: number }): Promise<HotelSearchResponse> =>
    apiClient.get('/hotel-search', { params }).then((r: AxiosResponse) => r.data),
}
