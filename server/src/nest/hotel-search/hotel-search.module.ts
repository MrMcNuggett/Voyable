import { Module } from '@nestjs/common';
import { HotelSearchController } from './hotel-search.controller';

@Module({
  controllers: [HotelSearchController],
})
export class HotelSearchModule {}
