import React, { useEffect, useState } from 'react'
import { Modal, Select, Input, Textarea, Button, Badge } from '../voyable'
import { useTranslation } from '../../i18n'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../shared/Toast'
import { tripsApi } from '../../api/client'
import { inquiriesApi } from '../../api/inquiries'
import { getApiErrorMessage, type Trip } from '../../types'
import type { InquiryTripSnapshot } from '@trek/shared'
import { ADVISORY_PRICE, ADVISORY_PERIOD } from '@trek/shared'

interface RequestAdvisoryModalProps {
  isOpen: boolean
  onClose: () => void
  /** When provided, the trip is pre-selected and locked (per-trip entry points). */
  trip?: Trip
}

function buildSnapshot(trip: Trip): InquiryTripSnapshot {
  return {
    tripName: trip.title,
    startDate: trip.start_date ?? null,
    endDate: trip.end_date ?? null,
    travelerCount: trip.shared_count != null ? trip.shared_count + 1 : 1,
    placesSavedCount: trip.place_count ?? 0,
  }
}

export default function RequestAdvisoryModal({ isOpen, onClose, trip }: RequestAdvisoryModalProps): React.ReactElement {
  const { t } = useTranslation()
  const toast = useToast()
  const userEmail = useAuthStore(s => s.user?.email)

  const [availableTrips, setAvailableTrips] = useState<Trip[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string | number>('')
  const [budgetRange, setBudgetRange] = useState('')
  const [travelStart, setTravelStart] = useState('')
  const [travelEnd, setTravelEnd] = useState('')
  const [interests, setInterests] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setBudgetRange(''); setTravelStart(''); setTravelEnd(''); setInterests(''); setMessage('')
    setEmail(userEmail || '')
    setError('')
    setSelectedTripId(trip ? trip.id : '')
    if (!trip) {
      tripsApi.list().then((data: { trips?: Trip[] }) => setAvailableTrips(data.trips || [])).catch(() => setAvailableTrips([]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trip])

  const effectiveTrip = trip || availableTrips.find(x => x.id === selectedTripId)

  const budgetOptions = [
    { value: 'Under 1,000 EUR', label: t('advisory.modal.budgetUnder1000') },
    { value: '1,000 – 2,500 EUR', label: t('advisory.modal.budget1000to2500') },
    { value: '2,500 – 5,000 EUR', label: t('advisory.modal.budget2500to5000') },
    { value: '5,000+ EUR', label: t('advisory.modal.budgetOver5000') },
  ]

  const handleSubmit = async (): Promise<void> => {
    setError('')
    setIsLoading(true)
    try {
      await inquiriesApi.create({
        trip_id: effectiveTrip ? Number(effectiveTrip.id) : undefined,
        trip_snapshot: effectiveTrip ? buildSnapshot(effectiveTrip) : undefined,
        budget_range: budgetRange || undefined,
        travel_start: travelStart || undefined,
        travel_end: travelEnd || undefined,
        interests: interests || undefined,
        message: message || undefined,
        email,
      })
      toast.success(t('advisory.modal.submitSuccess'))
      onClose()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t('advisory.modal.submitError')))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span>{t('advisory.modal.title')}</span>
          <Badge tone="primary">{t('advisory.modal.priceLabel', { price: `${ADVISORY_PRICE} EUR`, period: ADVISORY_PERIOD })}</Badge>
        </div>
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>{t('advisory.modal.cancel')}</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading || !email}>{t('advisory.modal.submit')}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-danger-soft text-danger text-caption px-3.5 py-2.5">{error}</div>}

        <p className="text-body text-content-secondary">{t('advisory.modal.subtitle')}</p>

        {!trip && (
          <Select
            value={selectedTripId}
            onChange={setSelectedTripId}
            options={[{ value: '', label: t('advisory.modal.tripPlaceholder') }, ...availableTrips.map(x => ({ value: x.id, label: x.title }))]}
            placeholder={t('advisory.modal.tripPlaceholder')}
          />
        )}

        {effectiveTrip && (
          <div className="flex items-center gap-3.5 rounded-xl bg-surface-tertiary px-4 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-body text-content truncate">{effectiveTrip.title}</div>
              <div className="mono text-caption text-content-muted mt-0.5">
                {effectiveTrip.start_date || '—'} – {effectiveTrip.end_date || '—'}
              </div>
            </div>
            <div className="text-caption font-semibold text-content-muted text-right shrink-0">
              {effectiveTrip.place_count ?? 0} {t('advisory.modal.placesSaved')}
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold text-content-secondary">{t('advisory.modal.budgetLabel')}</span>
          <Select
            value={budgetRange}
            onChange={(v) => setBudgetRange(String(v))}
            options={budgetOptions}
            placeholder={t('advisory.modal.budgetPlaceholder')}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Input label={t('advisory.modal.travelStart')} type="date" value={travelStart} onChange={e => setTravelStart(e.target.value)} />
          <Input label={t('advisory.modal.travelEnd')} type="date" value={travelEnd} onChange={e => setTravelEnd(e.target.value)} />
        </div>

        <Input
          label={t('advisory.modal.interestsLabel')}
          placeholder={t('advisory.modal.interestsPlaceholder')}
          value={interests}
          onChange={e => setInterests(e.target.value)}
        />

        <Textarea
          label={t('advisory.modal.messageLabel')}
          placeholder={t('advisory.modal.messagePlaceholder')}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <Input
          label={t('advisory.modal.emailLabel')}
          type="email"
          placeholder={t('advisory.modal.emailPlaceholder')}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
    </Modal>
  )
}
