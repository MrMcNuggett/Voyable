/**
 * Unit tests for handlePaddleEvent — event-type mapping, status-vocabulary
 * translation, idempotency and user-resolution branches not already covered
 * by the paddle-webhook integration test.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { testDb, dbMock } = vi.hoisted(() => {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  const mock = { db, closeDb: () => {}, reinitialize: () => {} };
  return { testDb: db, dbMock: mock };
});

vi.mock('../../../src/db/database', () => dbMock);

import { createTables } from '../../../src/db/schema';
import { runMigrations } from '../../../src/db/migrations';
import { createUser } from '../../helpers/factories';
import { handlePaddleEvent } from '../../../src/nest/paddle/paddle-webhook.service';

createTables(testDb);
runMigrations(testDb);

function userRow(id: number) {
  return testDb.prepare(
    'SELECT ai_planning_status, paddle_customer_id, paddle_subscription_id, ai_planning_plan, ai_planning_current_period_end FROM users WHERE id = ?'
  ).get(id) as {
    ai_planning_status: string;
    paddle_customer_id: string | null;
    paddle_subscription_id: string | null;
    ai_planning_plan: string | null;
    ai_planning_current_period_end: string | null;
  };
}

beforeEach(() => {
  testDb.exec('DELETE FROM subscription_events');
  testDb.exec('DELETE FROM users');
});

describe('handlePaddleEvent', () => {
  it('subscription.updated updates customer/subscription/status/period/plan and maps a yearly interval', () => {
    const { user } = createUser(testDb);
    const result = handlePaddleEvent({
      event_id: 'evt_updated_1',
      event_type: 'subscription.updated',
      data: {
        id: 'sub_1',
        customer_id: 'ctm_1',
        status: 'active',
        custom_data: { userId: user.id },
        current_billing_period: { ends_at: '2027-01-01T00:00:00Z' },
        items: [{ price: { billing_cycle: { interval: 'year' } } }],
      },
    });

    expect(result).toEqual({ status: 200, body: { received: true } });
    const row = userRow(user.id);
    expect(row.ai_planning_status).toBe('active');
    expect(row.paddle_customer_id).toBe('ctm_1');
    expect(row.paddle_subscription_id).toBe('sub_1');
    expect(row.ai_planning_plan).toBe('yearly');
    expect(row.ai_planning_current_period_end).toBe('2027-01-01T00:00:00Z');
  });

  it('transaction.completed records a ledger entry without touching subscription status', () => {
    const { user } = createUser(testDb);
    testDb.prepare("UPDATE users SET ai_planning_status = 'active' WHERE id = ?").run(user.id);

    const result = handlePaddleEvent({
      event_id: 'evt_txn_1',
      event_type: 'transaction.completed',
      data: {
        id: 'txn_1',
        customer_id: 'ctm_1',
        custom_data: { userId: user.id },
        currency_code: 'EUR',
        details: { totals: { grand_total: '900' } },
      },
    });

    expect(result).toEqual({ status: 200, body: { received: true } });
    expect(userRow(user.id).ai_planning_status).toBe('active');
    const event = testDb.prepare("SELECT kind, amount_cents, currency FROM subscription_events WHERE provider_ref = 'evt_txn_1'").get() as
      { kind: string; amount_cents: number; currency: string };
    expect(event).toEqual({ kind: 'transaction_completed', amount_cents: 900, currency: 'EUR' });
  });

  it('an unrecognized event type is a 200 no-op with no DB writes', () => {
    const { user } = createUser(testDb);
    const result = handlePaddleEvent({
      event_id: 'evt_unknown_1',
      event_type: 'something.else',
      data: { custom_data: { userId: user.id } },
    });

    expect(result).toEqual({ status: 200, body: { received: true, ignored: true } });
    const count = (testDb.prepare('SELECT COUNT(*) as c FROM subscription_events').get() as { c: number }).c;
    expect(count).toBe(0);
  });

  it('an event with no resolvable user (no custom_data, no matching customer_id) is a 200 unmatched', () => {
    const result = handlePaddleEvent({
      event_id: 'evt_unmatched_1',
      event_type: 'subscription.created',
      data: { id: 'sub_x', customer_id: 'ctm_does_not_exist', status: 'active' },
    });

    expect(result).toEqual({ status: 200, body: { received: true, unmatched: true } });
  });

  it('resolves the user by paddle_customer_id when custom_data is absent', () => {
    const { user } = createUser(testDb);
    testDb.prepare('UPDATE users SET paddle_customer_id = ? WHERE id = ?').run('ctm_known', user.id);

    const result = handlePaddleEvent({
      event_id: 'evt_by_customer_id',
      event_type: 'subscription.updated',
      data: { id: 'sub_2', customer_id: 'ctm_known', status: 'active' },
    });

    expect(result).toEqual({ status: 200, body: { received: true } });
    expect(userRow(user.id).paddle_subscription_id).toBe('sub_2');
  });

  it('replaying the same event_id short-circuits as a duplicate', () => {
    const { user } = createUser(testDb);
    const payload = {
      event_id: 'evt_dup_1',
      event_type: 'subscription.created' as const,
      data: { id: 'sub_3', customer_id: 'ctm_3', status: 'active', custom_data: { userId: user.id } },
    };

    expect(handlePaddleEvent(payload)).toEqual({ status: 200, body: { received: true } });
    expect(handlePaddleEvent(payload)).toEqual({ status: 200, body: { received: true, duplicate: true } });
  });

  it('maps trialing to active and paused to canceled', () => {
    const { user: trialUser } = createUser(testDb);
    handlePaddleEvent({
      event_id: 'evt_trial',
      event_type: 'subscription.updated',
      data: { id: 'sub_trial', customer_id: 'ctm_trial', status: 'trialing', custom_data: { userId: trialUser.id } },
    });
    expect(userRow(trialUser.id).ai_planning_status).toBe('active');

    const { user: pausedUser } = createUser(testDb);
    handlePaddleEvent({
      event_id: 'evt_paused',
      event_type: 'subscription.updated',
      data: { id: 'sub_paused', customer_id: 'ctm_paused', status: 'paused', custom_data: { userId: pausedUser.id } },
    });
    expect(userRow(pausedUser.id).ai_planning_status).toBe('canceled');
  });

  it('leaves ai_planning_status unchanged for an unrecognized Paddle status value', () => {
    const { user } = createUser(testDb);
    testDb.prepare("UPDATE users SET ai_planning_status = 'active' WHERE id = ?").run(user.id);

    handlePaddleEvent({
      event_id: 'evt_weird_status',
      event_type: 'subscription.updated',
      data: { id: 'sub_weird', customer_id: 'ctm_weird', status: 'some_future_status', custom_data: { userId: user.id } },
    });

    expect(userRow(user.id).ai_planning_status).toBe('active');
  });

  it('subscription.canceled forces canceled regardless of the data.status wording', () => {
    const { user } = createUser(testDb);
    handlePaddleEvent({
      event_id: 'evt_cancel_weird',
      event_type: 'subscription.canceled',
      data: { id: 'sub_cancel', customer_id: 'ctm_cancel', status: 'active', custom_data: { userId: user.id } },
    });
    expect(userRow(user.id).ai_planning_status).toBe('canceled');
  });

  it('an event with no status field at all neither updates status nor warns', () => {
    const { user } = createUser(testDb);
    handlePaddleEvent({
      event_id: 'evt_no_status',
      event_type: 'subscription.updated',
      data: { id: 'sub_no_status', customer_id: 'ctm_no_status', custom_data: { userId: user.id } },
    });
    expect(userRow(user.id).ai_planning_status).toBe('none');
  });

  it('an event with nothing to update skips the UPDATE entirely (empty data payload)', () => {
    const { user } = createUser(testDb);

    const result = handlePaddleEvent({
      event_id: 'evt_empty_data',
      event_type: 'subscription.updated',
      data: { custom_data: { userId: user.id } },
    });

    expect(result).toEqual({ status: 200, body: { received: true } });
    expect(userRow(user.id).ai_planning_status).toBe('none');
    expect(userRow(user.id).paddle_customer_id).toBeNull();
  });

  it('transaction.completed with no totals records a null amount', () => {
    const { user } = createUser(testDb);
    handlePaddleEvent({
      event_id: 'evt_txn_no_total',
      event_type: 'transaction.completed',
      data: { id: 'txn_2', customer_id: 'ctm_2', custom_data: { userId: user.id } },
    });
    const event = testDb.prepare("SELECT amount_cents, currency FROM subscription_events WHERE provider_ref = 'evt_txn_no_total'").get() as
      { amount_cents: number | null; currency: string | null };
    expect(event).toEqual({ amount_cents: null, currency: null });
  });
});
