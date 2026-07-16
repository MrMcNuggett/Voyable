import React from 'react'

/**
 * Voyable IconButton — square/round toolbar action holding a single icon.
 *
 * Token-only; used for the icon-only affordances the handoff calls out (toolbar
 * actions, hero tools, close/refresh buttons). `label` is required for a11y.
 */
export type IconButtonVariant = 'ghost' | 'surface' | 'accent'
export type IconButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-content-muted hover:bg-surface-hover hover:text-content border border-transparent',
  surface: 'bg-surface-card text-content-secondary hover:bg-surface-tertiary border border-edge shadow-card',
  accent: 'bg-accent text-accent-text hover:bg-accent-hover border border-transparent',
}

const SIZE: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
}

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  round?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', round = false, className = '', children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      data-slot="icon-button"
      className={[
        'inline-flex items-center justify-center shrink-0',
        round ? 'rounded-full' : 'rounded-xl',
        'transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.96]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-60 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
})

export default IconButton
