/**
 * Paddle webhook integration tests (#paddle-billing).
 * Covers signature verification, event-type → users column mapping,
 * idempotency on redelivered events, and the HasActiveSubscriptionGuard
 * gating the AI-planning suggest endpoint.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createHmac } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import type { Application } from 'express';
import type { INestApplication } from '@nestjs/common';

// ── DB mock (inline vi.hoisted pattern, matching oauth.test.ts/oidc.test.ts) ─

const { testDb, dbMock } = vi.hoisted(() => {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  const mock = {
    db,
    closeDb: () => {},
    reinitialize: () => {},
    getPlaceWithTags: () => null,
    canAccessTrip: (tripId: any, userId: number) =>
      db.prepare(`SELECT t.id, t.user_id FROM trips t LEFT JOIN trip_members m ON m.trip_id = t.id AND m.user_id = ? WHERE t.id = ? AND (t.user_id = ? OR m.user_id IS NOT NULL)`).get(userId, tripId, userId),
    isOwner: (tripId: any, userId: number) =>
      !!db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, userId),
  };
  return { testDb: db, dbMock: mock };
});

vi.mock('../../src/db/database', () => dbMock);
vi.mock('../../src/config', () => ({
  JWT_SECRET: 'test-jwt-secret-for-trek-testing-only',
  ENCRYPTION_KEY: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2',
  updateJwtSecret: () => {},
  SESSION_DURATION: '24h',
  SESSION_DURATION_MS: 86400000,
  SESSION_DURATION_SECONDS: 86400,
  DEFAULT_LANGUAGE: 'en',
}));
vi.mock('../../src/websocket', () => ({ broadcast: vi.fn(), broadcastToUser: vi.fn() }));

// Avoid hitting the real Anthropic API for the guard-passthrough test.
vi.mock('../../src/nest/ai-planning/clients/anthropic-server.client', () => ({
  suggestPlaces: vi.fn().mockResolvedValue([]),
}));

import { buildApp } from '../../src/bootstrap';
import { createTables } from '../../src/db/schema';
import { runMigrations } from '../../src/db/migrations';
import { resetTestDb, resetRateLimits } from '../helpers/test-db';
import { createUser, createTrip } from '../helpers/factories';
import { authCookie } from '../helpers/auth';

const WEBHOOK_SECRET = 'dummy_secret';

function loadFixture(name: string, userId: number): string {
  const raw = readFileSync(path.join(__dirname, '../fixtures/paddle', `${name}.json`), 'utf8');
  return raw.replaceAll('__TEST_USER_ID__', String(userId));
}

function sign(body: string, ts: number, secret: string = WEBHOOK_SECRET): string {
  const h1 = createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

interface UserRow {
  ai_planning_status: string;
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  ai_planning_plan: string | null;
  ai_planning_current_period_end: string | null;
}

function getUserRow(userId: number): UserRow {
  return testDb.prepare(
    'SELECT ai_planning_status, paddle_customer_id, paddle_subscription_id, ai_planning_plan, ai_planning_current_period_end FROM users WHERE id = ?'
  ).get(userId) as UserRow;
}

function countSubscriptionEvents(providerRef: string): number {
  return (testDb.prepare("SELECT COUNT(*) as c FROM subscription_events WHERE provider = 'paddle' AND provider_ref = ?").get(providerRef) as { c: number }).c;
}

let nestApp: INestApplication;
let app: Application;

beforeAll(async () => {
  createTables(testDb);
  runMigrations(testDb);
  process.env.PADDLE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  nestApp = await buildApp();
  app = nestApp.getHttpAdapter().getInstance();
});

beforeEach(() => {
  resetTestDb(testDb);
  resetRateLimits(nestApp);
});

afterAll(async () => {
  delete process.env.PADDLE_WEBHOOK_SECRET;
  await nestApp.close();
  testDb.close();
});

describe('POST /api/webhooks/paddle', () => {
  it('valid signature + subscription.created updates the user row and records a ledger entry', async () => {
    const { user } = createUser(testDb);
    const body = loadFixture('subscription-created', user.id);
    const ts = Math.floor(Date.now() / 1000);

    const res = await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .set('Paddle-Signature', sign(body, ts))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const row = getUserRow(user.id);
    expect(row.ai_planning_status).toBe('active');
    expect(row.paddle_customer_id).toBe('ctm_placeholder_001');
    expect(row.paddle_subscription_id).toBe('sub_placeholder_001');
    expect(row.ai_planning_plan).toBe('monthly');
    expect(row.ai_planning_current_period_end).toBe('2026-08-18T00:00:00Z');
    expect(countSubscriptionEvents('evt_placeholder_subscription_created_001')).toBe(1);
  });

  it('missing Paddle-Signature header is rejected with no DB change', async () => {
    const { user } = createUser(testDb);
    const body = loadFixture('subscription-created', user.id);

    const res = await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(401);
    expect(getUserRow(user.id).ai_planning_status).toBe('none');
    expect(countSubscriptionEvents('evt_placeholder_subscription_created_001')).toBe(0);
  });

  it('tampered signature is rejected with no DB change', async () => {
    const { user } = createUser(testDb);
    const body = loadFixture('subscription-created', user.id);
    const ts = Math.floor(Date.now() / 1000);

    const res = await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .set('Paddle-Signature', sign(body, ts, 'wrong_secret'))
      .send(body);

    expect(res.status).toBe(401);
    expect(getUserRow(user.id).ai_planning_status).toBe('none');
  });

  it('subscription.canceled sets ai_planning_status to canceled', async () => {
    const { user } = createUser(testDb);
    const body = loadFixture('subscription-canceled', user.id);
    const ts = Math.floor(Date.now() / 1000);

    const res = await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .set('Paddle-Signature', sign(body, ts))
      .send(body);

    expect(res.status).toBe(200);
    expect(getUserRow(user.id).ai_planning_status).toBe('canceled');
  });

  it('replaying the same event_id does not double-process', async () => {
    const { user } = createUser(testDb);
    const body = loadFixture('subscription-created', user.id);
    const ts1 = Math.floor(Date.now() / 1000);

    const first = await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .set('Paddle-Signature', sign(body, ts1))
      .send(body);
    expect(first.status).toBe(200);
    expect(first.body).toEqual({ received: true });

    const ts2 = Math.floor(Date.now() / 1000);
    const second = await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .set('Paddle-Signature', sign(body, ts2))
      .send(body);

    expect(second.status).toBe(200);
    expect(second.body).toEqual({ received: true, duplicate: true });
    expect(countSubscriptionEvents('evt_placeholder_subscription_created_001')).toBe(1);
  });
});

describe('HasActiveSubscriptionGuard on POST /api/trips/:tripId/ai-planning/suggest', () => {
  it('rejects with 403 not_entitled when the user has no active subscription', async () => {
    const { user } = createUser(testDb);
    const trip = createTrip(testDb, user.id);

    const res = await request(app)
      .post(`/api/trips/${trip.id}/ai-planning/suggest`)
      .set('Cookie', authCookie(user.id))
      .send();

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('not_entitled');
  });

  it('passes through once ai_planning_status is active (set via the subscription-created webhook)', async () => {
    const { user } = createUser(testDb);
    const trip = createTrip(testDb, user.id);

    const body = loadFixture('subscription-created', user.id);
    const ts = Math.floor(Date.now() / 1000);
    await request(app)
      .post('/api/webhooks/paddle')
      .set('Content-Type', 'application/json')
      .set('Paddle-Signature', sign(body, ts))
      .send(body);

    const res = await request(app)
      .post(`/api/trips/${trip.id}/ai-planning/suggest`)
      .set('Cookie', authCookie(user.id))
      .send();

    // NestJS defaults POST handlers to 201 Created; AiPlanningController.suggest()
    // never overrides it with @HttpCode(200), so 201 is the correct success status here.
    expect(res.status).toBe(201);
    expect(res.body.suggestions).toEqual([]);
  });
});
