/**
 * Provider-agnostic payment adapter (#subscription item 5). Deliberately NOT
 * coupled to Stripe/Paddle/etc — the payment provider is still an open
 * decision, so this interface is the seam a real adapter plugs into later.
 * NullPaymentAdapter is the only implementation today: it never crashes, it
 * just reports billing as not-yet-configured so the UI can show a graceful
 * state instead of a dead checkout button.
 */
import type { CheckoutProduct } from '@trek/shared';

export interface CreateCheckoutSessionInput {
  userId: number;
  product: CheckoutProduct;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentAdapter {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ checkoutUrl: string }>;
  cancelSubscription(userId: number): Promise<void>;
}

export class BillingNotConfiguredError extends Error {
  constructor() {
    super('Billing is not yet configured for this instance.');
    this.name = 'BillingNotConfiguredError';
  }
}

export class NullPaymentAdapter implements PaymentAdapter {
  async createCheckoutSession(_input: CreateCheckoutSessionInput): Promise<{ checkoutUrl: string }> {
    throw new BillingNotConfiguredError();
  }

  async cancelSubscription(_userId: number): Promise<void> {
    throw new BillingNotConfiguredError();
  }
}

// Swap for a real provider once one is chosen (Stripe/Paddle/LemonSqueezy/...).
export function getPaymentAdapter(): PaymentAdapter {
  return new NullPaymentAdapter();
}
