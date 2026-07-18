import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button, IconButton, Badge, SegmentedFilter, Avatar, AvatarStack, StatTile, EmptyState, Dropzone } from './index'

describe('Voyable component library', () => {
  it('FE-COMP-VOYABLE-001: Button renders label and forwards type/variant', () => {
    render(<Button variant="primary">Save trip</Button>)
    const btn = screen.getByRole('button', { name: 'Save trip' })
    expect(btn).toBeTruthy()
    expect(btn.getAttribute('data-variant')).toBe('primary')
    expect(btn.getAttribute('type')).toBe('button')
  })

  it('FE-COMP-VOYABLE-002: IconButton exposes its accessible label', () => {
    render(<IconButton label="Refresh"><span>i</span></IconButton>)
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy()
  })

  it('FE-COMP-VOYABLE-003: Badge renders children', () => {
    render(<Badge tone="success">Live</Badge>)
    expect(screen.getByText('Live')).toBeTruthy()
  })

  it('FE-COMP-VOYABLE-004: SegmentedFilter marks the active option', () => {
    render(
      <SegmentedFilter
        value="a"
        onChange={() => {}}
        options={[{ value: 'a', label: 'Planned' }, { value: 'b', label: 'Archived' }]}
      />,
    )
    const active = screen.getByRole('tab', { name: 'Planned' })
    expect(active.getAttribute('aria-selected')).toBe('true')
  })

  it('FE-COMP-VOYABLE-005: Avatar falls back to initials', () => {
    render(<Avatar name="Jane Doe" />)
    expect(screen.getByText('JD')).toBeTruthy()
  })

  it('FE-COMP-VOYABLE-006: AvatarStack shows an overflow count', () => {
    render(<AvatarStack max={2} people={[{ name: 'A A' }, { name: 'B B' }, { name: 'C C' }, { name: 'D D' }]} />)
    expect(screen.getByText('+2')).toBeTruthy()
  })

  it('FE-COMP-VOYABLE-007: StatTile hero variant carries the dark-petrol slot flag', () => {
    const { container } = render(<StatTile hero label="Countries" value={12} />)
    expect(container.querySelector('[data-slot="stat-tile"][data-hero="true"]')).toBeTruthy()
  })

  it('FE-COMP-VOYABLE-008: EmptyState renders title + action', () => {
    render(<EmptyState title="No trips yet" actionLabel="New trip" onAction={() => {}} />)
    expect(screen.getByText('No trips yet')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'New trip' })).toBeTruthy()
  })

  it('FE-COMP-VOYABLE-009: Dropzone renders as an accessible button target', () => {
    render(<Dropzone onFiles={() => {}} title="Drop files" hint="or click to browse" />)
    expect(screen.getByText('Drop files')).toBeTruthy()
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
