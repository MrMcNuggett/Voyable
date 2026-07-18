import { Body, Controller, Get, HttpException, Post, UseGuards } from '@nestjs/common';
import type { User } from '../../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createCheckoutRequestSchema, type CreateCheckoutRequest } from '@trek/shared';
import { getStatus, getBillingHistory } from '../../services/subscriptionService';
import { getPaymentAdapter, BillingNotConfiguredError } from '../../services/paymentAdapter';
import { getAppUrl } from '../../services/notifications';

/**
 * /api/subscription — entitlement status + billing history + checkout
 * (#subscription item 5). Checkout delegates to the provider-agnostic
 * paymentAdapter; until a real provider is wired in, it always reports
 * "not configured" rather than crashing.
 */
@Controller('api/subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  @Get('status')
  status(@CurrentUser() user: User) {
    return {
      ...getStatus(user.id),
      advisory: { pay_per_request: true as const },
    };
  }

  @Get('billing-history')
  billingHistory(@CurrentUser() user: User) {
    return getBillingHistory(user.id);
  }

  @Post('checkout')
  async checkout(@CurrentUser() user: User, @Body(new ZodValidationPipe(createCheckoutRequestSchema)) body: CreateCheckoutRequest) {
    const appUrl = getAppUrl();
    try {
      return await getPaymentAdapter().createCheckoutSession({
        userId: user.id,
        product: body.product,
        successUrl: `${appUrl}/pricing?checkout=success`,
        cancelUrl: `${appUrl}/pricing?checkout=canceled`,
      });
    } catch (err) {
      if (err instanceof BillingNotConfiguredError) {
        throw new HttpException({ error: 'billing_not_configured', message: err.message }, 501);
      }
      throw err;
    }
  }
}
