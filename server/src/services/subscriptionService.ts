import { db } from '../db/database';
import type { AiPlanningStatus, SubscriptionEvent } from '@trek/shared';

export function getStatus(userId: number): { ai_planning_status: AiPlanningStatus; ai_planning_current_period_end: string | null } {
  const row = db.prepare('SELECT ai_planning_status, ai_planning_current_period_end FROM users WHERE id = ?').get(userId) as
    { ai_planning_status: AiPlanningStatus; ai_planning_current_period_end: string | null } | undefined;
  return row ?? { ai_planning_status: 'none', ai_planning_current_period_end: null };
}

export function getBillingHistory(userId: number): { events: SubscriptionEvent[] } {
  const events = db.prepare(`
    SELECT id, kind, amount_cents, currency, provider, created_at
    FROM subscription_events
    WHERE user_id = ?
    ORDER BY id DESC
  `).all(userId) as SubscriptionEvent[];
  return { events };
}
