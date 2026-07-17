import React, { useCallback, useEffect, useState } from 'react'
import { MessageCircle, CheckCircle2, Archive as ArchiveIcon } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { inquiriesApi } from '../../api/inquiries'
import { Badge, SegmentedFilter, Button } from '../../components/voyable'
import type { Inquiry, InquiryStatus } from '@trek/shared'

type StatusFilter = InquiryStatus | 'all'

const BADGE_TONE: Record<InquiryStatus, 'warning' | 'neutral' | 'info'> = {
  new: 'warning',
  answered: 'neutral',
  archived: 'info',
}

export default function AdminInquiriesTab(): React.ReactElement {
  const { t, locale } = useTranslation()
  const [entries, setEntries] = useState<Inquiry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true)
    try {
      const data = await inquiriesApi.adminList({ status: status === 'all' ? undefined : status, limit: 100, offset: 0 })
      setEntries(data.entries || [])
      setTotal(data.total ?? 0)
    } catch {
      setEntries([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filter) }, [filter, load])

  const updateStatus = async (id: number, status: InquiryStatus): Promise<void> => {
    try {
      const { inquiry } = await inquiriesApi.adminUpdateStatus(id, status)
      setEntries(prev => prev.map(e => e.id === id ? inquiry : e))
    } catch { /* leave list as-is on failure */ }
  }

  const fmtDate = (iso: string): string => {
    try { return new Date(iso.endsWith('Z') ? iso : iso + 'Z').toLocaleDateString(locale, { month: 'short', day: 'numeric' }) }
    catch { return iso }
  }

  const statusLabel = (s: InquiryStatus): string => (
    s === 'new' ? t('admin.inquiries.statusNew') : s === 'answered' ? t('admin.inquiries.statusAnswered') : t('admin.inquiries.statusArchived')
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg m-0 flex items-center gap-2 text-content">
          <MessageCircle size={20} />
          {t('admin.inquiries.title')}
        </h2>
        <p className="text-sm m-0 mt-1 text-content-muted">{t('admin.inquiries.subtitle')}</p>
      </div>

      <SegmentedFilter<StatusFilter>
        size="sm"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('admin.inquiries.filterAll') },
          { value: 'new', label: t('admin.inquiries.statusNew') },
          { value: 'answered', label: t('admin.inquiries.statusAnswered') },
          { value: 'archived', label: t('admin.inquiries.statusArchived') },
        ]}
      />

      {loading && entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-content-muted">{t('common.loading')}</div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-content-muted">{t('admin.inquiries.empty')}</div>
      ) : (
        <div className="space-y-2.5">
          {entries.map(inquiry => {
            const open = expandedId === inquiry.id
            const snapshot = inquiry.trip_snapshot
            return (
              <div key={inquiry.id} className="rounded-2xl border border-edge overflow-hidden">
                <button
                  onClick={() => setExpandedId(open ? null : inquiry.id)}
                  className="w-full grid gap-3 items-center px-4 py-3.5 bg-transparent text-left"
                  style={{ gridTemplateColumns: '1fr 1.3fr 100px 90px' }}
                >
                  <span className="text-body font-semibold text-content truncate">{inquiry.requester_username || `#${inquiry.user_id ?? '—'}`}</span>
                  <span className="text-caption text-content-muted truncate">{snapshot?.tripName || t('admin.inquiries.noTrip')}</span>
                  <Badge tone={BADGE_TONE[inquiry.status]} className="w-fit">{statusLabel(inquiry.status)}</Badge>
                  <span className="mono text-caption text-content-muted text-right">{fmtDate(inquiry.created_at)}</span>
                </button>

                {open && (
                  <div className="border-t border-edge bg-surface-tertiary p-4 space-y-3.5">
                    {snapshot && (
                      <div className="flex items-center gap-3.5 rounded-xl bg-surface-card px-3.5 py-3">
                        <div className="min-w-0">
                          <div className="font-display font-bold text-body text-content truncate">{snapshot.tripName}</div>
                          <div className="mono text-caption text-content-muted mt-0.5">
                            {snapshot.startDate || '—'} – {snapshot.endDate || '—'} · {snapshot.travelerCount ?? 1} · {snapshot.placesSavedCount ?? 0} {t('advisory.modal.placesSaved')}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-caption font-bold uppercase tracking-wide text-content-faint mb-1">{t('admin.inquiries.budget')}</div>
                        <div className="text-body text-content">{inquiry.budget_range || '—'}</div>
                      </div>
                      <div>
                        <div className="text-caption font-bold uppercase tracking-wide text-content-faint mb-1">{t('admin.inquiries.email')}</div>
                        <div className="text-body text-content">{inquiry.email}</div>
                      </div>
                    </div>

                    {inquiry.interests && (
                      <div>
                        <div className="text-caption font-bold uppercase tracking-wide text-content-faint mb-1">{t('admin.inquiries.interests')}</div>
                        <div className="text-body text-content">{inquiry.interests}</div>
                      </div>
                    )}

                    {inquiry.message && (
                      <div>
                        <div className="text-caption font-bold uppercase tracking-wide text-content-faint mb-1">{t('admin.inquiries.message')}</div>
                        <div className="text-body text-content-secondary whitespace-pre-wrap">{inquiry.message}</div>
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-1">
                      {inquiry.status !== 'answered' && (
                        <Button variant="outline" size="sm" icon={<CheckCircle2 size={14} />} onClick={() => updateStatus(inquiry.id, 'answered')}>
                          {t('admin.inquiries.markAnswered')}
                        </Button>
                      )}
                      {inquiry.status !== 'archived' && (
                        <Button variant="outline" size="sm" icon={<ArchiveIcon size={14} />} onClick={() => updateStatus(inquiry.id, 'archived')}>
                          {t('admin.inquiries.archive')}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {total > entries.length && (
        <p className="text-xs m-0 text-content-faint">{entries.length} / {total}</p>
      )}
    </div>
  )
}
