import { z } from 'zod';

export const AI_PLANNING_STATUSES = ['none', 'active', 'canceled', 'past_due'] as const;
export const aiPlanningStatusSchema = z.enum(AI_PLANNING_STATUSES).catch('none').default('none');
export type AiPlanningStatus = (typeof AI_PLANNING_STATUSES)[number];

export const AI_PLANNING_PLANS = ['monthly', 'yearly'] as const;
export const aiPlanningPlanSchema = z.enum(AI_PLANNING_PLANS).nullable();
export type AiPlanningPlan = (typeof AI_PLANNING_PLANS)[number];

export const subscriptionStatusResponseSchema = z.object({
  ai_planning_status: aiPlanningStatusSchema,
  ai_planning_current_period_end: z.string().nullable(),
  ai_planning_plan: aiPlanningPlanSchema,
  // Advisory is pay-per-request, not a subscription — no status beyond "available".
  advisory: z.object({ pay_per_request: z.literal(true) }),
});
export type SubscriptionStatusResponse = z.infer<typeof subscriptionStatusResponseSchema>;

export const subscriptionEventSchema = z.object({
  id: z.number(),
  kind: z.string(),
  amount_cents: z.number().nullable(),
  currency: z.string().nullable(),
  provider: z.string().nullable(),
  created_at: z.string(),
});
export type SubscriptionEvent = z.infer<typeof subscriptionEventSchema>;

export const billingHistoryResponseSchema = z.object({
  events: z.array(subscriptionEventSchema),
});
export type BillingHistoryResponse = z.infer<typeof billingHistoryResponseSchema>;

export const checkoutProductSchema = z.enum(['ai_planning', 'advisory']);
export type CheckoutProduct = z.infer<typeof checkoutProductSchema>;

export const createCheckoutRequestSchema = z.object({
  product: checkoutProductSchema,
});
export type CreateCheckoutRequest = z.infer<typeof createCheckoutRequestSchema>;
