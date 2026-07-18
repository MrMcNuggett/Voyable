import apiClient from './client'
import type { AxiosResponse } from 'axios'
import type { BillingHistoryResponse, CheckoutProduct, CreateCheckoutRequest, SubscriptionStatusResponse } from '@trek/shared'

const base = '/subscription'

/** Axios calls for subscription/entitlement status, billing history and checkout. */
export const subscriptionApi = {
  status: (): Promise<SubscriptionStatusResponse> =>
    apiClient.get(`${base}/status`).then((r: AxiosResponse) => r.data),

  billingHistory: (): Promise<BillingHistoryResponse> =>
    apiClient.get(`${base}/billing-history`).then((r: AxiosResponse) => r.data),

  checkout: (product: CheckoutProduct): Promise<{ checkoutUrl: string }> =>
    apiClient.post(`${base}/checkout`, { product } satisfies CreateCheckoutRequest).then((r: AxiosResponse) => r.data),
}
