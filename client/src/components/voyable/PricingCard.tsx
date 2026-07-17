import React from 'react'
import { Check } from 'lucide-react'
import Button from './Button'

/**
 * Voyable PricingCard — tier card for the revenue streams (free planner,
 * optional AI planning subscription, personal advisory priced per request).
 * Mirrors the handoff PricingCard spec, implemented with real Tailwind classes
 * bound to the semantic tokens instead of copying the inline styles verbatim.
 * Set `featured` on exactly one card per row (fills petrol) to anchor the
 * recommended tier.
 */
export interface PricingCardProps {
  tier: string
  price: string
  period?: string
  description?: string
  features?: string[]
  featured?: boolean
  ctaLabel?: string
  onCtaClick?: () => void
  disabled?: boolean
}

export default function PricingCard({
  tier, price, period, description, features = [], featured = false, ctaLabel = 'Choose plan', onCtaClick, disabled = false,
}: PricingCardProps): React.ReactElement {
  return (
    <div
      data-slot="pricing-card"
      data-featured={featured || undefined}
      className={[
        'w-[260px] flex flex-col gap-4 rounded-2xl p-7',
        featured ? 'bg-accent shadow-elevated' : 'bg-surface-card border border-edge shadow-card',
      ].join(' ')}
    >
      <div className={['font-display font-bold text-subtitle', featured ? 'text-accent-text' : 'text-content'].join(' ')}>{tier}</div>
      <div className="flex items-baseline gap-1">
        <span className={['font-display font-extrabold text-title', featured ? 'text-accent-text' : 'text-content'].join(' ')} style={{ fontSize: 'calc(36px * var(--fs-scale-title, 1))' }}>{price}</span>
        {period && <span className={['text-caption', featured ? 'text-accent-text opacity-80' : 'text-content-muted'].join(' ')}>{period}</span>}
      </div>
      <div className={['text-caption', featured ? 'text-accent-text opacity-90' : 'text-content-secondary'].join(' ')}>{description}</div>
      <div className="flex flex-col gap-2.5 mt-1">
        {features.map((f, i) => (
          <div key={i} className={['flex items-center gap-2 text-caption', featured ? 'text-accent-text' : 'text-content'].join(' ')}>
            <Check size={14} className={featured ? 'text-accent-text' : 'text-accent-route'} />
            {f}
          </div>
        ))}
      </div>
      <Button
        variant={featured ? 'secondary' : 'primary'}
        className={['mt-2', featured ? '!bg-surface-card !text-accent' : ''].join(' ')}
        block
        disabled={disabled}
        onClick={onCtaClick}
      >
        {ctaLabel}
      </Button>
    </div>
  )
}
