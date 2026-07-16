import React from 'react'

/**
 * Voyable Button — the canonical action control.
 *
 * Token-only (petrol accent, stone neutrals, full-pill radius) so it follows the
 * user's scheme + dark mode automatically. Mirrors the handoff Button spec
 * (variant / size / icon), implemented with TREK's semantic Tailwind utilities.
 *
 * Variants: primary (petrol fill) · secondary (olive fill) · outline · ghost ·
 * danger. Sizes: sm / md / lg. Full-pill, sentence-case labels, ease-out lift on
 * hover, no opacity-dim except when disabled.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-text hover:bg-accent-hover border border-transparent',
  secondary: 'bg-olive-300 text-ink-900 hover:bg-olive-400 border border-transparent',
  outline: 'bg-transparent text-content hover:bg-surface-tertiary border border-edge',
  ghost: 'bg-transparent text-content hover:bg-surface-hover border border-transparent',
  danger: 'bg-danger text-white hover:brightness-95 border border-transparent',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-caption gap-1.5',
  md: 'h-11 px-5 text-body gap-2',
  lg: 'h-[52px] px-6 text-subtitle gap-2.5',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  block?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconPosition = 'left', block, className = '', children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      data-variant={variant}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold',
        'transition-[background-color,transform,box-shadow,filter] duration-150 ease-out',
        'hover:-translate-y-px active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0',
        VARIANT[variant],
        SIZE[size],
        block ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {icon && iconPosition === 'left' ? <span className="shrink-0" aria-hidden>{icon}</span> : null}
      {children}
      {icon && iconPosition === 'right' ? <span className="shrink-0" aria-hidden>{icon}</span> : null}
    </button>
  )
})

export default Button
