import React from 'react'

/**
 * Voyable Avatar + AvatarStack.
 *
 * Shows a user image or initials on an on-brand tinted background (deterministic
 * from a seed, drawn from the petrol/olive/ink scales — never the old rainbow
 * gradients). Token-only: the seed gradients reference palette CSS variables, so
 * they stay on-brand in light and dark.
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE_PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56 }

// On-brand seed gradients (petrol / olive / ink family) as CSS-var stops.
const SEEDS: [string, string][] = [
  ['var(--petrol-400)', 'var(--petrol-600)'],
  ['var(--olive-300)', 'var(--olive-500)'],
  ['var(--petrol-300)', 'var(--petrol-500)'],
  ['var(--ink-500)', 'var(--ink-700)'],
  ['var(--petrol-500)', 'var(--petrol-700)'],
  ['var(--olive-400)', 'var(--olive-600)'],
]

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function seedIndex(seed: string | number | null | undefined): number {
  if (typeof seed === 'number') return Math.abs(seed) % SEEDS.length
  const s = String(seed ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % SEEDS.length
}

export interface AvatarProps {
  name?: string | null
  src?: string | null
  seed?: string | number | null
  size?: AvatarSize
  className?: string
  title?: string
}

export function Avatar({ name, src, seed, size = 'md', className = '', title }: AvatarProps): React.ReactElement {
  const px = SIZE_PX[size]
  const [a, b] = SEEDS[seedIndex(seed ?? name)]
  const fontPx = Math.round(px * 0.4)
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        title={title ?? name ?? undefined}
        className={['inline-block rounded-full object-cover ring-2 ring-surface-card', className].join(' ')}
        style={{ width: px, height: px }}
      />
    )
  }
  return (
    <span
      title={title ?? name ?? undefined}
      className={['inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface-card', className].join(' ')}
      style={{ width: px, height: px, fontSize: `${fontPx}px`, background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {initials(name)}
    </span>
  )
}

export interface AvatarStackProps {
  people: { name?: string | null; src?: string | null; id?: string | number }[]
  max?: number
  size?: AvatarSize
  className?: string
}

export function AvatarStack({ people, max = 4, size = 'sm', className = '' }: AvatarStackProps): React.ReactElement {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  const px = SIZE_PX[size]
  return (
    <div className={['flex items-center', className].join(' ')}>
      {shown.map((p, i) => (
        <span key={p.id ?? i} className={i === 0 ? '' : '-ml-2'}>
          <Avatar name={p.name} src={p.src} seed={p.id ?? p.name} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="-ml-2 inline-flex items-center justify-center rounded-full bg-surface-tertiary text-content-secondary font-semibold ring-2 ring-surface-card"
          style={{ width: px, height: px, fontSize: `${Math.round(px * 0.36)}px` }}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}

export default Avatar
