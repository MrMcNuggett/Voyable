/**
 * Unit tests for PaddleWebhookController's own branches (missing rawBody,
 * invalid JSON, and the catch-all 500) — the happy path and signature
 * rejection are already covered end-to-end by the integration test.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';
import type { Request, Response } from 'express';
import { PaddleWebhookController } from '../../../src/nest/paddle/paddle-webhook.controller';
import * as webhookService from '../../../src/nest/paddle/paddle-webhook.service';

const SECRET = 'dummy_secret';

function sign(body: string, ts: number = Math.floor(Date.now() / 1000)): string {
  const h1 = createHmac('sha256', SECRET).update(`${ts}:${body}`).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

function mockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

function mockReq(rawBody: Buffer | undefined, header?: string): Request {
  return { rawBody, headers: { 'paddle-signature': header } } as unknown as Request;
}

describe('PaddleWebhookController', () => {
  const controller = new PaddleWebhookController();

  beforeEach(() => {
    delete process.env.PADDLE_WEBHOOK_SECRET;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('responds 400 missing_raw_body when req.rawBody is absent', async () => {
    const res = mockRes();
    await controller.handle(mockReq(undefined), res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'missing_raw_body' });
  });

  it('responds 400 invalid_json for a correctly signed but non-JSON body', async () => {
    const body = 'not json';
    const res = mockRes();
    await controller.handle(mockReq(Buffer.from(body), sign(body)), res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'invalid_json' });
  });

  it('responds 500 processing_failed when handlePaddleEvent throws', async () => {
    vi.spyOn(webhookService, 'handlePaddleEvent').mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const body = JSON.stringify({ event_id: 'evt_x', event_type: 'subscription.created', data: {} });
    const res = mockRes();
    await controller.handle(mockReq(Buffer.from(body), sign(body)), res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'processing_failed' });
  });
});
