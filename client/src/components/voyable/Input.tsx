import React from 'react'

/**
 * Voyable Input — token-only text field with an optional label/icon/error.
 * Mirrors the handoff Input spec, implemented with real Tailwind classes
 * bound to the semantic tokens (border-edge, bg-surface-card, ring-accent)
 * instead of copying the design-reference inline styles verbatim.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, className = '', id, ...rest },
  ref,
) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      {label && <span className="text-caption font-semibold text-content-secondary">{label}</span>}
      <div className={[
        'flex items-center gap-2 h-[46px] px-3.5 rounded-lg bg-surface-card',
        'border transition-[border-color,box-shadow] duration-150 ease-out',
        error ? 'border-danger' : 'border-edge focus-within:border-accent',
        error ? '' : 'focus-within:ring-2 focus-within:ring-accent-subtle',
      ].join(' ')}>
        {icon ? <span className="shrink-0 text-content-muted" aria-hidden>{icon}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={['flex-1 min-w-0 bg-transparent outline-none border-none text-body text-content placeholder:text-content-faint', className].join(' ')}
          {...rest}
        />
      </div>
      {error && <span className="text-caption text-danger">{error}</span>}
    </label>
  )
})

export default Input
