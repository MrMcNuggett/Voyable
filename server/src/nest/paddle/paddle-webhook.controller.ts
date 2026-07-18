import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { verifyPaddleSignature } from './paddle-signature';
import { handlePaddleEvent } from './paddle-webhook.service';

/**
 * POST /api/webhooks/paddle — inbound Paddle Billing notifications
 * (#paddle-billing). Unauthenticated but signature-verified: no JwtAuthGuard,
 * same shape as the auth:false plugin-webhook precedent in
 * plugins-proxy.controller.ts. Reads req.rawBody (populated because
 * bootstrap.ts already builds the Nest app with `{ rawBody: true }`).
 */
@Controller('api/webhooks/paddle')
export class PaddleWebhookController {
  @Post()
  @HttpCode(200)
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      res.status(400).json({ error: 'missing_raw_body' });
      return;
    }

    // PADDLE-TODO: replace with the real webhook signing secret from
    // Paddle Dashboard > Developer Tools > Notifications once you have an
    // account. The "dummy_secret" default only verifies internally-generated
    // test signatures (see server/scripts/paddle-webhook-test.mjs).
    const secret = process.env.PADDLE_WEBHOOK_SECRET ?? 'dummy_secret';
    const signatureHeader = req.headers['paddle-signature'];
    const header = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;

    if (!verifyPaddleSignature(rawBody, header, secret)) {
      res.status(401).json({ error: 'invalid_signature' });
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).json({ error: 'invalid_json' });
      return;
    }

    try {
      const result = handlePaddleEvent(payload as Parameters<typeof handlePaddleEvent>[0]);
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('[paddle webhook] processing failed:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: 'processing_failed' });
    }
  }
}
