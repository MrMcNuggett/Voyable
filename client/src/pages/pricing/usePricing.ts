import { useRef, useState } from 'react'
import type { CheckoutButtonHandle } from '../../components/Subscription/CheckoutButton'

/**
 * Pricing page data hook — owns the Advisory-modal visibility state and the
 * CheckoutButton ref. PricingPage is a pure wiring container that renders
 * what this returns.
 */
export function usePricing() {
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false)
  const checkoutButtonRef = useRef<CheckoutButtonHandle>(null)

  return { showAdvisoryModal, setShowAdvisoryModal, checkoutButtonRef }
}
