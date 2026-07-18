import React from 'react'

/**
 * Voyable Textarea — token-only multi-line field with an optional label/error.
 * Mirrors the handoff Textarea spec, implemented with real Tailwind classes
 * bound to the semantic tokens instead of copying the inline styles verbatim.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, rows = 4, className = '', id, ...rest },
  ref,
) {
  const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <label htmlFor={textareaId} className="flex flex-col gap-1.5">
      {label && <span className="text-caption font-semibold text-content-secondary">{label}</span>}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={[
          'px-3.5 py-3 rounded-lg bg-surface-card resize-y outline-none',
          'text-body text-content placeholder:text-content-faint',
          'border transition-[border-color,box-shadow] duration-150 ease-out',
          error ? 'border-danger' : 'border-edge focus:border-accent focus:ring-2 focus:ring-accent-subtle',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && <span className="text-caption text-danger">{error}</span>}
    </label>
  )
})

export default Textarea
