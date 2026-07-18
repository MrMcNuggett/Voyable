import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { useTranslation } from '../../i18n'
import { useToast } from '../shared/Toast'
import { configApi } from '../../api/client'
import { useAuthStore } from '../../store/authStore'

// PADDLE-TODO: replace with the real Price ID from Paddle Dashboard > Catalog
// once you have an account. This placeholder will never resolve against a
// real Paddle environment.
const PADDLE_PRICE_ID_PLACEHOLDER = 'pri_placeholder_monthly'

export interface CheckoutButtonHandle {
  open: () => void
}

export interface CheckoutButtonProps {
  priceId?: string
}

/**
 * Wraps Paddle's overlay checkout (Paddle.Checkout.open). Not rendered as its
 * own visible button — PricingPage keeps using the shared PricingCard's
 * onCtaClick slot and calls ref.current.open() from there, so this component
 * doesn't need to touch that shared UI primitive.
 *
 * customData.userId is what the /api/webhooks/paddle handler reads back
 * (payload.data.custom_data.userId) to bind the resulting subscription to
 * this Voyable user — there's no other reliable correlation before Paddle
 * has ever seen this customer.
 */
const CheckoutButton = forwardRef<CheckoutButtonHandle, CheckoutButtonProps>(function CheckoutButton(
  { priceId = PADDLE_PRICE_ID_PLACEHOLDER },
  ref
) {
  const { t } = useTranslation()
  const toast = useToast()
  const user = useAuthStore((s) => s.user)
  const paddleRef = useRef<Paddle | undefined>(undefined)

  useImperativeHandle(ref, () => ({
    open: () => {
      void (async () => {
        const config = await configApi.getPublicConfig()
        if (!config.paddleClientToken) {
          // No real account yet — keep this crash-free instead of calling
          // initializePaddle with an empty token.
          toast.error(t('pricing.billingNotConfigured'))
          return
        }

        if (!paddleRef.current) {
          paddleRef.current = await initializePaddle({
            token: config.paddleClientToken,
            environment: config.paddleEnvironment,
          })
        }

        paddleRef.current?.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customData: user ? { userId: String(user.id) } : undefined,
        })
      })()
    },
  }))

  return null
})

export default CheckoutButton
