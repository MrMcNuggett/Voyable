/**
 * Voyable Design System — canonical reusable component surface.
 *
 * New Voyable primitives live in this folder. The "known gap" components the
 * design handoff called out are provided here so screens compose one consistent,
 * token-backed set instead of improvising per screen:
 *
 *   New primitives (this folder):
 *     Button, IconButton, Badge, SegmentedFilter, Avatar/AvatarStack,
 *     StatTile (+ dark-petrol hero variant), EmptyState, Dropzone
 *
 *   Canonicalized existing TREK components (re-exported with Voyable names so
 *     there is a single import surface; already token-based / Voyable-styled):
 *     Modal (dialog shell), Tabs (SlidingTabs), Select (CustomSelect),
 *     DateTimePicker (CustomDateTimePicker), PlaceAvatar, ConfirmDialog
 *
 * Navbar (account dropdown + notification bell) and the boarding-pass hero card
 * remain page-level compositions in components/Layout and pages/DashboardPage —
 * both are already token-based; see CLAUDE.md.
 */

// New primitives
export { default as Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'
export { default as IconButton } from './IconButton'
export type { IconButtonProps } from './IconButton'
export { default as Badge } from './Badge'
export type { BadgeProps, BadgeTone } from './Badge'
export { default as SegmentedFilter } from './SegmentedFilter'
export type { SegmentedFilterProps, SegmentedOption } from './SegmentedFilter'
export { Avatar, AvatarStack, default as AvatarDefault } from './Avatar'
export type { AvatarProps, AvatarStackProps, AvatarSize } from './Avatar'
export { default as StatTile } from './StatTile'
export type { StatTileProps } from './StatTile'
export { default as EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
export { default as Dropzone } from './Dropzone'
export type { DropzoneProps } from './Dropzone'

// Canonicalized existing components (single import surface)
export { default as Modal } from '../shared/Modal'
export { default as Tabs, SlidingTabs } from '../shared/SlidingTabs'
export type { SlidingTab } from '../shared/SlidingTabs'
export { default as Select } from '../shared/CustomSelect'
export { CustomDateTimePicker as DateTimePicker, CustomDatePicker as DatePicker } from '../shared/CustomDateTimePicker'
export { default as PlaceAvatar } from '../shared/PlaceAvatar'
export { default as ConfirmDialog } from '../shared/ConfirmDialog'
