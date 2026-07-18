import { Module } from '@nestjs/common';
import { InquiriesController, InquiriesAdminController } from './inquiries.controller';

@Module({
  controllers: [InquiriesController, InquiriesAdminController],
})
export class InquiriesModule {}
