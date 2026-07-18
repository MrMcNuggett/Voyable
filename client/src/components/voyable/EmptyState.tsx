import React from 'react'
import Button from './Button'

/**
 * Voyable EmptyState — centered icon well + title + description + optional action.
 * Icon sits in a petrol-subtle well; title uses the display font. Token-only.
 */
export interface EmptyStateProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actionLabel?: React.ReactNode
  onAction?: () => void
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps): React.ReactElement {
  return (
    <div className={['flex flex-col items-center text-center gap-2.5 px-8 py-12', className].join(' ')}>
      {icon ? (
        <div className="mb-1.5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-accent-on">
          {icon}
        </div>
      ) : null}
      <div className="font-display text-xl font-bold text-content">{title}</div>
      {description ? <div className="max-w-xs text-body text-content-secondary">{description}</div> : null}
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
