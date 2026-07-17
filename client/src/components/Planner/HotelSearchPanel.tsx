import React, { useState } from 'react'
import { Search, BedDouble } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { Input, Button } from '../voyable'
import { hotelSearchApi } from '../../api/hotelSearch'
import type { HotelResult } from '@trek/shared'

export default function HotelSearchPanel(): React.ReactElement {
  const { t } = useTranslation()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [results, setResults] = useState<HotelResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (): Promise<void> => {
    if (!location.trim()) return
    setLoading(true)
    setError('')
    try {
      const { results } = await hotelSearchApi.search({ location: location.trim(), checkIn: checkIn || undefined, checkOut: checkOut || undefined, guests })
      setResults(results)
    } catch {
      setError(t('hotelSearch.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-surface-card border border-edge shadow-card p-3.5" style={{ marginBottom: 22 }}>
      <div className="mb-1">
        <h2 className="font-display font-bold text-subtitle text-content m-0">{t('hotelSearch.title')}</h2>
        <p className="text-caption text-content-muted mt-1">{t('hotelSearch.subtitle')}</p>
      </div>

      <div className="grid gap-2.5 mt-3.5" style={{ gridTemplateColumns: '1.4fr 1fr 1fr auto' }}>
        <Input label={t('hotelSearch.whereLabel')} placeholder={t('hotelSearch.wherePlaceholder')} value={location} onChange={e => setLocation(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input label={t('hotelSearch.datesLabel')} type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
          <Input label=" " type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
        </div>
        <Input label={t('hotelSearch.guestsLabel')} type="number" min={1} max={20} value={guests} onChange={e => setGuests(Number(e.target.value) || 1)} />
        <Button variant="primary" icon={<Search size={14} />} onClick={handleSearch} disabled={loading || !location.trim()} style={{ alignSelf: 'end' }}>
          {t('hotelSearch.searchCta')}
        </Button>
      </div>

      {error && <div className="text-caption text-danger mt-3">{error}</div>}

      {!results && !loading && !error && (
        <div className="text-caption text-content-muted text-center py-7">{t('hotelSearch.empty')}</div>
      )}

      {results && results.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-3.5">
          {results.map((r, i) => {
            const cheapest = Math.min(...r.partnerPrices.map(p => p.price))
            return (
              <div key={i} className="flex gap-4 rounded-2xl border border-edge bg-surface-card shadow-card p-3.5">
                <div className="w-[120px] h-[88px] rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--petrol-200), var(--olive-200))' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-body font-bold text-content">{r.name}</div>
                      <div className="text-caption text-content-muted mt-0.5">{r.area} · {r.rating} · {r.type}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="mono font-bold text-content" style={{ fontSize: 'calc(18px * var(--fs-scale-body, 1))' }}>{r.pricePerNight} {r.currency}</div>
                      <div className="text-caption text-content-muted">{t('hotelSearch.perNight', { nights: r.nights })}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2.5">
                    {r.partnerPrices.map(p => {
                      const isCheapest = p.price === cheapest
                      return (
                        <div
                          key={p.partner}
                          className={isCheapest ? 'flex items-center justify-between gap-2.5 rounded-lg border border-accent px-2.5 py-1.5 bg-accent-subtle' : 'flex items-center justify-between gap-2.5 rounded-lg border border-edge px-2.5 py-1.5'}
                        >
                          <span className={isCheapest ? 'text-caption font-semibold text-accent' : 'text-caption text-content-muted'}>{p.partner}</span>
                          <span className={isCheapest ? 'mono text-caption font-bold text-accent' : 'mono text-caption font-bold text-content'}>{p.price} {r.currency}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
          <p className="text-caption text-content-faint text-center mt-1">{t('hotelSearch.disclaimer')}</p>
        </div>
      )}
    </div>
  )
}
