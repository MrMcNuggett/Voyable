import React from 'react'

/**
 * Voyable Dropzone — file drop target with drag-over state.
 *
 * Dashed stone border at rest, petrol-tinted on drag-over. Token-only; behavior
 * (file handling) stays with the caller — this is chrome + drag state only.
 */
export interface DropzoneProps {
  onFiles: (files: FileList) => void
  icon?: React.ReactNode
  title: React.ReactNode
  hint?: React.ReactNode
  accept?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export default function Dropzone({
  onFiles,
  icon,
  title,
  hint,
  accept,
  multiple = true,
  disabled = false,
  className = '',
}: DropzoneProps): React.ReactElement {
  const [over, setOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={e => { e.preventDefault(); if (!disabled) setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault()
        setOver(false)
        if (!disabled && e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click() }}
      data-slot="dropzone"
      className={[
        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-8 py-10 text-center',
        'transition-[background-color,border-color] duration-200 ease-out',
        disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer',
        over ? 'border-accent bg-accent-subtle' : 'border-edge bg-surface-secondary hover:border-accent',
        className,
      ].join(' ')}
    >
      {icon ? <div className="text-content-muted">{icon}</div> : null}
      <div className="text-body font-semibold text-content">{title}</div>
      {hint ? <div className="text-caption text-content-muted">{hint}</div> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={e => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}
