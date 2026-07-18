import { db } from '../../db/database';

interface PaddleWebhookPayload {
  event_id: string;
  event_type: string;
  data: {
    id?: string;
    customer_id?: string;
    subscription_id?: string;
    status?: string;
    custom_data?: { userId?: string | number } | null;
    current_billing_period?: { ends_at?: string } | null;
    items?: Array<{ price?: { billing_cycle?: { interval?: string } } }>;
    currency_code?: string;
    details?: { totals?: { grand_total?: string } };
  };
}

interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

// Paddle's own subscription status vocabulary is wider than this app's
// entitlement enum (none/active/canceled/past_due). Judgment calls, flagged
// for future revisit:
//   trialing -> active   (grants entitlement during the trial period)
//   paused   -> canceled (app has no "paused" concept)
const PADDLE_STATUS_TO_AI_PLANNING_STATUS: Record<string, 'active' | 'canceled' | 'past_due'> = {
  active: 'active',
  trialing: 'active',
  past_due: 'past_due',
  paused: 'canceled',
  canceled: 'canceled',
};

function mapPlanInterval(interval: string | undefined): 'monthly' | 'yearly' | undefined {
  if (interval === 'month') return 'monthly';
  if (interval === 'year') return 'yearly';
  return undefined;
}

function resolveUserId(data: PaddleWebhookPayload['data']): number | undefined {
  const fromCustomData = data.custom_data?.userId;
  if (fromCustomData !== undefined && fromCustomData !== null && fromCustomData !== '') {
    const parsed = Number(fromCustomData);
    if (Number.isInteger(parsed)) return parsed;
  }
  if (data.customer_id) {
    const row = db.prepare('SELECT id FROM users WHERE paddle_customer_id = ?').get(data.customer_id) as { id: number } | undefined;
    if (row) return row.id;
  }
  return undefined;
}

function alreadyProcessed(eventId: string): boolean {
  const row = db
    .prepare("SELECT id FROM subscription_events WHERE provider = 'paddle' AND provider_ref = ? LIMIT 1")
    .get(eventId) as { id: number } | undefined;
  return !!row;
}

function recordEvent(userId: number, kind: string, eventId: string, amountCents: number | null, currency: string | null): void {
  db.prepare(
    'INSERT INTO subscription_events (user_id, kind, amount_cents, currency, provider, provider_ref) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, kind, amountCents, currency, 'paddle', eventId);
}

function applySubscriptionFields(userId: number, data: PaddleWebhookPayload['data'], forceStatus?: 'canceled'): void {
  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.customer_id) {
    updates.push('paddle_customer_id = ?');
    params.push(data.customer_id);
  }
  if (data.id) {
    updates.push('paddle_subscription_id = ?');
    params.push(data.id);
  }

  const mappedStatus = forceStatus ?? (data.status ? PADDLE_STATUS_TO_AI_PLANNING_STATUS[data.status] : undefined);
  if (mappedStatus) {
    updates.push('ai_planning_status = ?');
    params.push(mappedStatus);
  } else if (data.status) {
    console.warn(`[paddle webhook] unrecognized subscription status "${data.status}" — leaving ai_planning_status unchanged`);
  }

  if (data.current_billing_period?.ends_at) {
    updates.push('ai_planning_current_period_end = ?');
    params.push(data.current_billing_period.ends_at);
  }

  const interval = mapPlanInterval(data.items?.[0]?.price?.billing_cycle?.interval);
  if (interval) {
    updates.push('ai_planning_plan = ?');
    params.push(interval);
  }

  if (updates.length === 0) return;
  params.push(userId);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
}

export function handlePaddleEvent(payload: PaddleWebhookPayload): HandlerResult {
  if (alreadyProcessed(payload.event_id)) {
    return { status: 200, body: { received: true, duplicate: true } };
  }

  const userId = resolveUserId(payload.data);
  if (userId === undefined) {
    // 2xx so Paddle doesn't retry forever on an event we can never map to a
    // user (deliberate choice, not an oversight).
    console.warn(`[paddle webhook] could not resolve a user for event ${payload.event_id} (${payload.event_type})`);
    return { status: 200, body: { received: true, unmatched: true } };
  }

  switch (payload.event_type) {
    case 'subscription.created':
      applySubscriptionFields(userId, payload.data);
      recordEvent(userId, 'subscription_created', payload.event_id, null, null);
      break;
    case 'subscription.updated':
      applySubscriptionFields(userId, payload.data);
      recordEvent(userId, 'subscription_updated', payload.event_id, null, null);
      break;
    case 'subscription.canceled':
      applySubscriptionFields(userId, payload.data, 'canceled');
      recordEvent(userId, 'subscription_canceled', payload.event_id, null, null);
      break;
    case 'transaction.completed': {
      // subscription.* events own ai_planning_status/period-end — a transaction
      // event arriving slightly out of order must not stomp newer subscription
      // state, so this only records a billing-history ledger entry.
      const amountCents = payload.data.details?.totals?.grand_total
        ? parseInt(payload.data.details.totals.grand_total, 10)
        : null;
      recordEvent(userId, 'transaction_completed', payload.event_id, amountCents, payload.data.currency_code ?? null);
      break;
    }
    default:
      console.warn(`[paddle webhook] unhandled event type "${payload.event_type}"`);
      return { status: 200, body: { received: true, ignored: true } };
  }

  return { status: 200, body: { received: true } };
}
