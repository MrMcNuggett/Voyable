import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/services/subscriptionService', () => ({
  getStatus: vi.fn().mockReturnValue({ ai_planning_status: 'none', ai_planning_current_period_end: null, ai_planning_plan: null }),
  getBillingHistory: vi.fn().mockReturnValue({ events: [] }),
}));
vi.mock('../../../src/services/notifications', () => ({ getAppUrl: () => 'http://localhost:3001' }));

import { SubscriptionController } from '../../../src/nest/subscription/subscription.controller';
import { getPaymentAdapter, BillingNotConfiguredError } from '../../../src/services/paymentAdapter';

vi.mock('../../../src/services/paymentAdapter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/services/paymentAdapter')>();
  return { ...actual, getPaymentAdapter: vi.fn() };
});

describe('SubscriptionController.checkout', () => {
  const controller = new SubscriptionController();
  const user = { id: 1 } as never;

  it('returns 501 billing_not_configured when the adapter throws BillingNotConfiguredError', async () => {
    vi.mocked(getPaymentAdapter).mockReturnValueOnce({
      createCheckoutSession: vi.fn().mockRejectedValue(new BillingNotConfiguredError()),
      cancelSubscription: vi.fn(),
    });

    await expect(controller.checkout(user, { product: 'ai_planning' })).rejects.toMatchObject({ status: 501 });
  });

  it('rethrows any other error unchanged', async () => {
    const otherError = new Error('unexpected');
    vi.mocked(getPaymentAdapter).mockReturnValueOnce({
      createCheckoutSession: vi.fn().mockRejectedValue(otherError),
      cancelSubscription: vi.fn(),
    });

    await expect(controller.checkout(user, { product: 'ai_planning' })).rejects.toBe(otherError);
  });
});
