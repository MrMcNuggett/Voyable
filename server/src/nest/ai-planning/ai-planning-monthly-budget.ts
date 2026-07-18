/**
 * Per-user monthly budget for the AI planning add-on (#ai-planning). Near-copy
 * of the plugin DailyBudget pattern (server/src/nest/plugins/host/daily-budget.ts)
 * but keyed by user_id instead of plugin_id, and the counting window is a
 * calendar month rather than a UTC day — counts live in memory, seeded on
 * first use per user from ai_planning_usage so a restart doesn't reset the
 * month's quota.
 *
 * Unlike the plugin budget (which reserves on every attempt), this only counts
 * successful generations: `hasAiPlanningBudget` peeks without consuming, and
 * the caller only calls `recordAiPlanningUsage` after both the Anthropic call
 * and the ai_planning_usage insert succeed — a failed/errored attempt (bad
 * key, timeout, provider outage) must not burn a user's monthly allowance.
 *
 * TODO: once real billing lands (batch 3's NullPaymentAdapter → a real
 * provider), tie this window to users.ai_planning_current_period_end instead
 * of the calendar month, so the cap matches the actual billing period rather
 * than the calendar month.
 */
import { db } from '../../db/database';

export function envCap(name: string, def: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return def;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : def;
}

export const AI_PLANNING_PER_MONTH = envCap('AI_PLANNING_PER_MONTH', 60);

/** The UTC calendar month of a timestamp, as a comparable 'YYYY-MM' string. */
function utcMonth(now: number): string {
  return new Date(now).toISOString().slice(0, 7);
}

/** Start-of-month ISO instant (00:00 UTC on the 1st) for a given timestamp. */
function utcMonthStart(now: number): string {
  const d = new Date(now);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

interface CachedCount {
  month: string;
  count: number;
}

const cache = new Map<number, CachedCount>();

function seedFromLedger(userId: number, now: number): number {
  const row = db.prepare(
    'SELECT COUNT(*) as c FROM ai_planning_usage WHERE user_id = ? AND created_at >= ?',
  ).get(userId, utcMonthStart(now)) as { c: number };
  return row.c;
}

function currentCount(userId: number, now: number): CachedCount {
  const month = utcMonth(now);
  const cached = cache.get(userId);
  if (cached && cached.month === month) return cached;
  const fresh: CachedCount = { month, count: seedFromLedger(userId, now) };
  cache.set(userId, fresh);
  return fresh;
}

/** Peek: would this user have room for one more generation this calendar month? Does not consume. */
export function hasAiPlanningBudget(userId: number, now: number = Date.now()): boolean {
  return currentCount(userId, now).count < AI_PLANNING_PER_MONTH;
}

/** Call only after a generation actually succeeds and is persisted to ai_planning_usage. */
export function recordAiPlanningUsage(userId: number, now: number = Date.now()): void {
  const entry = currentCount(userId, now);
  entry.count += 1;
}
