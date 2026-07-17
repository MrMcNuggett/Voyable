import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Sparkles, HelpCircle } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { subscriptionApi } from '../../api/subscription'
import Section from './Section'
import type { AiPlanningStatus, SubscriptionEvent } from '@trek/shared'

export default function SubscriptionTab(): React.ReactElement {
  const { t } = useTranslation()
  const [aiStatus, setAiStatus] = useState<AiPlanningStatus>('none')
  const [events, setEvents] = useState<SubscriptionEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([subscriptionApi.status(), subscriptionApi.billingHistory()])
      .then(([status, history]) => {
        setAiStatus(status.ai_planning_status)
        setEvents(history.events || [])
      })
      .catch(() => { /* leave defaults */ })
      .finally(() => setLoading(false))
  }, [])

  const aiActive = aiStatus === 'active'

  return (
    <Section title={t('settings.tabs.subscription')} icon={CreditCard}>
      <p className="text-caption text-content-secondary" style={{ marginTop: -4 }}>{t('subscription.tab.subtitle')}</p>

      <div className="flex flex-col gap-3.5 max-w-[520px]">
        <div className="flex items-center gap-3.5 rounded-2xl border border-edge px-4.5 py-4">
          <div className="w-10 h-10 rounded-[11px] bg-[var(--olive-50)] text-[var(--olive-500)] flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="text-body font-semibold text-content">{t('subscription.tab.aiLabel')}</div>
            <div className="text-caption text-content-muted mt-0.5">
              {aiActive ? t('subscription.tab.aiStatusActive') : t('subscription.tab.aiStatusNotSubscribed')}
            </div>
          </div>
          {!aiActive && (
            <Link to="/pricing" className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-accent-text text-caption font-semibold no-underline">
              {t('subscription.tab.upgradeCta')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-edge px-4.5 py-4">
          <div className="w-10 h-10 rounded-[11px] bg-accent-subtle text-accent flex items-center justify-center flex-shrink-0">
            <HelpCircle size={18} />
          </div>
          <div className="flex-1">
            <div className="text-body font-semibold text-content">{t('subscription.tab.advisoryLabel')}</div>
            <div className="text-caption text-content-muted mt-0.5">{t('subscription.tab.advisoryStatus')}</div>
          </div>
          <Link to="/pricing" className="inline-flex items-center px-4 py-2 rounded-lg border border-edge text-content-secondary text-caption font-semibold no-underline">
            {t('subscription.tab.seePlansCta')}
          </Link>
        </div>

        <div className="pt-4 mt-0.5 border-t border-edge">
          <div className="text-caption font-semibold text-content-secondary mb-2">{t('subscription.tab.billingHistoryLabel')}</div>
          <div className="rounded-xl border border-edge overflow-hidden">
            {loading ? (
              <div className="py-7 text-center text-caption text-content-muted">{t('common.loading')}</div>
            ) : events.length === 0 ? (
              <div className="py-7 text-center text-caption text-content-muted">{t('subscription.tab.billingHistoryEmpty')}</div>
            ) : (
              <div className="divide-y divide-edge">
                {events.map(e => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-caption">
                    <span className="text-content">{e.kind}</span>
                    <span className="mono text-content-muted">{e.created_at}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
