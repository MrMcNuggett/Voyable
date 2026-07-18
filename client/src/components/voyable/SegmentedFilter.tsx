import React from 'react'

/**
 * Voyable SegmentedFilter — the pill filter/segmented control (distinct from the
 * sliding Tabs). A stone track holding pill options; the active option is a
 * raised petrol-tinted pill. Used for Planned/Archived/Completed-style toggles.
 *
 * Token-only. Controlled via `value` + `onChange`.
 */
export interface SegmentedOption<T extends string = string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
}

export interface SegmentedFilterProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}

export default function SegmentedFilter<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  ariaLabel,
}: SegmentedFilterProps<T>): React.ReactElement {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-caption' : 'px-4 py-2 text-body'
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={['inline-flex items-center gap-1 rounded-full bg-surface-tertiary p-1', className].join(' ')}
    >
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={[
              'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
              'transition-[background-color,color,box-shadow] duration-150 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              pad,
              active
                ? 'bg-surface-card text-accent-on shadow-card'
                : 'bg-transparent text-content-muted hover:text-content',
            ].join(' ')}
          >
            {opt.icon ? <span className="shrink-0" aria-hidden>{opt.icon}</span> : null}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
