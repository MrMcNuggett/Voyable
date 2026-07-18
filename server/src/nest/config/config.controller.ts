import { Controller, Get } from '@nestjs/common';
import type { PublicConfig } from '@trek/shared';
import { DEFAULT_LANGUAGE } from '../../config';

/**
 * /api/config — public (unauthenticated) bootstrap config.
 *
 * Originally byte-identical to the legacy Express route
 * (server/src/routes/publicConfig.ts): no auth guard, just the server's
 * configured default language. Now also surfaces the Paddle client token +
 * environment (#paddle-billing) — both safe-to-be-public values the frontend
 * needs before initializing Paddle.js. Deliberately has no service; it just
 * reads config constants/env vars directly.
 */
@Controller('api/config')
export class ConfigController {
  @Get()
  getConfig(): PublicConfig {
    return {
      defaultLanguage: DEFAULT_LANGUAGE,
      paddleClientToken: process.env.PADDLE_CLIENT_TOKEN || null, // PADDLE-TODO: real client token
      paddleEnvironment: process.env.PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
    };
  }
}
