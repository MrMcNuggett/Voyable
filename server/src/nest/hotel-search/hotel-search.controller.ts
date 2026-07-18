import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { hotelSearchQuerySchema, type HotelSearchQuery } from '@trek/shared';
import { getHotelSearchAdapter } from '../../services/hotelSearchAdapter';

/**
 * /api/hotel-search — affiliate hotel/accommodation price comparison
 * (#hotel-search item 3). Deliberately separate from /api/inquiries — no
 * shared recommendation logic, no commission inside the advisory flow.
 */
@Controller('api/hotel-search')
@UseGuards(JwtAuthGuard)
export class HotelSearchController {
  @Get()
  async search(@Query(new ZodValidationPipe(hotelSearchQuerySchema)) query: HotelSearchQuery) {
    const results = await getHotelSearchAdapter().search(query);
    return { results };
  }
}
