import { Module } from '@nestjs/common';
import { AiPlanningController } from './ai-planning.controller';

@Module({
  controllers: [AiPlanningController],
})
export class AiPlanningModule {}
