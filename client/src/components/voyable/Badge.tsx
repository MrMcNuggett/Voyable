import React from 'react'

/**
 * Voyable Badge — small pill for status/metadata.
 *
 * Token-only tones. `neutral` uses stone, `primary` petrol, plus the semantic
 * status tones (success/warning/danger/info). Full-pill, sentence-case.
 */
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface-tertiary text-content-secondary',
  primary: 'bg-accent-subtle text-accent-on',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  icon?: React.ReactNode
}

export default function Badge({ tone = 'neutral', icon, className = '', children, ...rest }: BadgeProps): React.ReactElement {
  return (
    <span
      data-slot="badge"
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold',
        TONE[tone],
        className,
      ].join(' ')}
      {...rest}
    >
      {icon ? <span className="shrink-0" aria-hidden>{icon}</span> : null}
      {children}
    </span>
  )
}
