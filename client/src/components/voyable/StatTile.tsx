import React from 'react'

/**
 * Voyable StatTile — the dashboard "glass" stat card.
 *
 * Default = light raised surface. `hero` = the single dark-petrol accent surface
 * allowed once per screen (petrol-700→800, never pure black) — use it for one
 * standout tile only. Big value renders in the mono data font.
 *
 * Token-only.
 */
export interface StatTileProps {
  label: React.ReactNode
  value: React.ReactNode
  unit?: React.ReactNode
  /** Small line under the value (delta / caption). */
  footer?: React.ReactNode
  /** Extra content (flags, sparkline, etc.) rendered below. */
  children?: React.ReactNode
  /** Render as the one dark-petrol hero surface for the screen. */
  hero?: boolean
  className?: string
  onClick?: () => void
}

export default function StatTile({
  label,
  value,
  unit,
  footer,
  children,
  hero = false,
  className = '',
  onClick,
}: StatTileProps): React.ReactElement {
  const interactive = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      data-slot="stat-tile"
      data-hero={hero || undefined}
      className={[
        'relative overflow-hidden rounded-2xl border p-6',
        'transition-[transform,box-shadow] duration-200 ease-out',
        hero
          ? 'bg-petrol-700 border-petrol-800 text-white shadow-lg'
          : 'bg-surface-card border-edge text-content shadow-card hover:shadow-lg hover:-translate-y-0.5',
        interactive ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      <div className={hero ? 'text-caption font-semibold text-white/65' : 'text-caption font-semibold text-content-muted'}>
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="mono font-display text-4xl font-semibold leading-none">{value}</span>
        {unit ? (
          <span className={hero ? 'text-subtitle text-white/65' : 'text-subtitle text-content-muted'}>{unit}</span>
        ) : null}
      </div>
      {footer ? (
        <div className={hero ? 'mt-2 text-caption text-white/65' : 'mt-2 text-caption text-content-muted'}>{footer}</div>
      ) : null}
      {children}
    </div>
  )
}
