import { Module } from '@nestjs/common';
import { PaddleWebhookController } from './paddle-webhook.controller';

@Module({ controllers: [PaddleWebhookController] })
export class PaddleModule {}
