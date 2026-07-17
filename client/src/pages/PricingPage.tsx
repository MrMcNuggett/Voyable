import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n'
import PageShell from '../components/Layout/PageShell'
import { PricingCard, Button } from '../components/voyable'
import { useToast } from '../components/shared/Toast'
import { subscriptionApi } from '../api/subscription'
import RequestAdvisoryModal from '../components/Trip/RequestAdvisoryModal'
import { getApiErrorMessage } from '../types'
import { ADVISORY_PRICE, ADVISORY_PERIOD, AI_PLANNING_PRICE, AI_PLANNING_PERIOD } from '@trek/shared'

export default function PricingPage(): React.ReactElement {
  const { t } = useTranslation()
  const toast = useToast()
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const startAiCheckout = async (): Promise<void> => {
    setCheckingOut(true)
    try {
      const { checkoutUrl } = await subscriptionApi.checkout('ai_planning')
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('pricing.billingNotConfigured')))
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <PageShell background="var(--bg-secondary)">
      <div className="max-w-[980px] mx-auto px-7 pt-10 pb-24 text-center">
        <div className="text-left mb-6">
          <Link to="/dashboard" className="text-body font-semibold text-content-secondary no-underline hover:underline">
            {t('pricing.backToDashboard')}
          </Link>
        </div>

        <h1 className="font-display font-bold text-title text-content mb-3" style={{ fontSize: 'calc(40px * var(--fs-scale-title, 1))' }}>{t('pricing.h1')}</h1>
        <p className="text-body text-content-secondary mb-12 max-w-[560px] mx-auto">{t('pricing.subtitle')}</p>

        <div className="flex flex-wrap items-stretch justify-center gap-5">
          <div className="w-[260px] flex flex-col gap-4 rounded-2xl p-7 bg-surface-card border border-edge shadow-card text-left">
            <div className="font-display font-bold text-subtitle text-content">{t('pricing.planner.tier')}</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-content" style={{ fontSize: 'calc(36px * var(--fs-scale-title, 1))' }}>{t('pricing.planner.price')}</span>
            </div>
            <div className="text-caption text-content-secondary">{t('pricing.planner.description')}</div>
            <div className="flex flex-col gap-2.5 mt-1">
              {[t('pricing.planner.feature1'), t('pricing.planner.feature2'), t('pricing.planner.feature3')].map(f => (
                <div key={f} className="flex items-center gap-2 text-caption text-content">
                  <span className="text-accent-route">✓</span>{f}
                </div>
              ))}
            </div>
            <Button variant="outline" block disabled className="mt-2 cursor-default">{t('pricing.planner.cta')}</Button>
          </div>

          <PricingCard
            tier={t('pricing.ai.tier')}
            price={AI_PLANNING_PRICE}
            period={AI_PLANNING_PERIOD}
            description={t('pricing.ai.description')}
            features={[t('pricing.ai.feature1'), t('pricing.ai.feature2'), t('pricing.ai.feature3'), t('pricing.ai.feature4')]}
            featured
            ctaLabel={t('pricing.ai.cta')}
            onCtaClick={startAiCheckout}
            disabled={checkingOut}
          />

          <PricingCard
            tier={t('pricing.advisory.tier')}
            price={ADVISORY_PRICE}
            period={ADVISORY_PERIOD}
            description={t('pricing.advisory.description')}
            features={[t('pricing.advisory.feature1'), t('pricing.advisory.feature2'), t('pricing.advisory.feature3'), t('pricing.advisory.feature4')]}
            ctaLabel={t('advisory.navButton')}
            onCtaClick={() => setShowAdvisoryModal(true)}
          />
        </div>

        <p className="text-caption text-content-faint mt-4">{t('pricing.priceDisclaimer')}</p>

        <div className="mt-14 pt-8 border-t border-edge text-left max-w-[640px] mx-auto">
          <h2 className="font-display font-bold text-subtitle text-content mb-3">{t('pricing.footnoteTitle')}</h2>
          <p className="text-body text-content-secondary">{t('pricing.footnoteBody')}</p>
        </div>
      </div>

      <RequestAdvisoryModal isOpen={showAdvisoryModal} onClose={() => setShowAdvisoryModal(false)} />
    </PageShell>
  )
}
