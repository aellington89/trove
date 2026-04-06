import { useState, useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { useUIStore, useMediaTypesStore, useItemsStore } from '../../stores'
import { StarRating } from '../ui/StarRating'
import type { FieldDefinition } from '../../../../shared/types'
import styles from './AddItemModal.module.css'

const STATUS_OPTIONS = [
  'Owned',
  'Wishlist',
  'Borrowed',
  'Lent Out',
  'Completed',
  'In Progress',
] as const

const INPUT_CLASS =
  'h-8 w-full rounded-lg border border-edge bg-surface-tertiary px-3 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none'

export function AddItemModal() {
  const addModalOpen = useUIStore((s) => s.addModalOpen)
  const setAddModalOpen = useUIStore((s) => s.setAddModalOpen)
  const activeTypeFilter = useUIStore((s) => s.activeTypeFilter)
  const mediaTypes = useMediaTypesStore((s) => s.mediaTypes)
  const createItem = useItemsStore((s) => s.createItem)

  const [isClosing, setIsClosing] = useState(false)
  const [selectedType, setSelectedType] = useState(
    () => activeTypeFilter ?? mediaTypes[0]?.key ?? ''
  )
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string>('Owned')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [metadata, setMetadata] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (addModalOpen) {
      const defaultType = activeTypeFilter ?? mediaTypes[0]?.key ?? ''
      setSelectedType(defaultType)
      setTitle('')
      setStatus('Owned')
      setRating(0)
      setNotes('')
      setMetadata({})
      setErrors({})
      setIsSubmitting(false)
      // Focus title input after render
      requestAnimationFrame(() => titleRef.current?.focus())
    }
  }, [addModalOpen, activeTypeFilter, mediaTypes])

  // Escape key handler
  useEffect(() => {
    if (!addModalOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [addModalOpen])

  // Body scroll lock
  useEffect(() => {
    if (addModalOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [addModalOpen])

  function handleClose() {
    setIsClosing(true)
  }

  function handleAnimationEnd(e: React.AnimationEvent) {
    if (isClosing && e.target === e.currentTarget) {
      setIsClosing(false)
      setAddModalOpen(false)
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const cleanMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([, v]) => v != null && v !== '')
      )
      await createItem({
        type: selectedType,
        title: title.trim(),
        status,
        rating: rating > 0 ? rating : undefined,
        metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : undefined,
        notes: notes.trim() || undefined,
      })
      handleClose()
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : 'Failed to create item' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function setMetadataField(key: string, value: unknown) {
    setMetadata((prev) => ({ ...prev, [key]: value }))
  }

  function handleTypeChange(typeKey: string) {
    setSelectedType(typeKey)
    setMetadata({})
  }

  const handleRatingChange = useCallback((value: number) => {
    setRating(value)
  }, [])

  if (!addModalOpen && !isClosing) return null

  const selectedMediaType = mediaTypes.find((mt) => mt.key === selectedType)
  const fieldsSchema = selectedMediaType?.fields_schema ?? []

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
        isClosing ? styles.overlayClosing : styles.overlay
      }`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <form
        className={`w-full max-w-lg rounded-xl bg-surface-secondary shadow-lg ${
          isClosing ? styles.panelClosing : styles.panel
        }`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-edge px-5 py-3.5">
          <h2 className="font-heading text-lg font-semibold text-content-primary">Add Item</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-content-muted transition-colors hover:text-content-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {/* Media type tabs */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Media type">
            {mediaTypes.map((mt) => (
              <button
                key={mt.key}
                type="button"
                role="tab"
                aria-selected={mt.key === selectedType}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  mt.key === selectedType
                    ? 'bg-surface-active text-content-primary'
                    : 'text-content-muted hover:text-content-secondary'
                }`}
                onClick={() => handleTypeChange(mt.key)}
              >
                <span>{mt.icon}</span>
                <span>{mt.label}</span>
              </button>
            ))}
          </div>

          {/* Common fields */}
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label htmlFor="add-title" className="mb-1 block text-xs font-medium text-content-secondary">
                Title <span className="text-accent">*</span>
              </label>
              <input
                ref={titleRef}
                id="add-title"
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
                }}
                placeholder="Enter title..."
                className={`${INPUT_CLASS} ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="add-status" className="mb-1 block text-xs font-medium text-content-secondary">
                Status
              </label>
              <select
                id="add-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={INPUT_CLASS}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Star rating */}
            <div>
              <span className="mb-1 block text-xs font-medium text-content-secondary">Rating</span>
              <StarRating rating={rating} size="md" onChange={handleRatingChange} />
            </div>
          </div>

          {/* Type-specific fields */}
          {fieldsSchema.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-edge pt-4">
              <p className="text-xs font-medium text-content-muted">
                {selectedMediaType?.label} Details
              </p>
              {fieldsSchema.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={metadata[field.key] ?? ''}
                  onChange={(value) => setMetadataField(field.key, value)}
                />
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <label htmlFor="add-notes" className="mb-1 block text-xs font-medium text-content-secondary">
              Notes
            </label>
            <textarea
              id="add-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
              className={`${INPUT_CLASS} h-auto py-2`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-edge px-5 py-3.5">
          <div>
            {errors._form && (
              <p className="text-xs text-red-500">{errors._form}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-8 rounded-lg px-4 text-sm font-medium text-content-muted transition-colors hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-8 items-center rounded-lg bg-accent px-4 text-sm font-medium text-content-inverse transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
}) {
  const id = `add-field-${field.key}`

  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-content-secondary">
          {field.label}
        </label>
        <select
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value || '')}
          className={INPUT_CLASS}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-content-secondary">
          {field.label}
        </label>
        <input
          id={id}
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder={field.label}
          className={INPUT_CLASS}
        />
      </div>
    )
  }

  // text and combobox both render as plain text input
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-content-secondary">
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        className={INPUT_CLASS}
      />
    </div>
  )
}
