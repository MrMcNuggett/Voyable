import { db } from '../db/database';
import type { AiPlanningPlan, AiPlanningStatus, SubscriptionEvent } from '@trek/shared';

export function getStatus(userId: number): { ai_planning_status: AiPlanningStatus; ai_planning_current_period_end: string | null; ai_planning_plan: AiPlanningPlan | null } {
  const row = db.prepare('SELECT ai_planning_status, ai_planning_current_period_end, ai_planning_plan FROM users WHERE id = ?').get(userId) as
    { ai_planning_status: AiPlanningStatus; ai_planning_current_period_end: string | null; ai_planning_plan: AiPlanningPlan | null } | undefined;
  return row ?? { ai_planning_status: 'none', ai_planning_current_period_end: null, ai_planning_plan: null };
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
