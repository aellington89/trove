import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import { useItemsStore, useMediaTypesStore, useUIStore } from '../../stores'
import { StarRating } from '../ui/StarRating'
import { CoverImage } from '../grid/CoverImage'
import { getCreator } from '../../lib/get-creator'
import { formatDate } from '../../lib/format-date'
import { trapFocus } from '../../lib/focus-trap'
import type { FieldDefinition } from '../../../../shared/types'
import styles from './ItemDetailPanel.module.css'

const STATUS_OPTIONS = [
  'Owned',
  'Wishlist',
  'Borrowed',
  'Lent Out',
  'Completed',
  'In Progress',
] as const

export function ItemDetailPanel(): ReactElement | null {
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)
  const setDetailPanelOpen = useUIStore((s) => s.setDetailPanelOpen)
  const selectedItem = useItemsStore((s) => s.selectedItem)
  const items = useItemsStore((s) => s.items)
  const updateItem = useItemsStore((s) => s.updateItem)
  const deleteItem = useItemsStore((s) => s.deleteItem)
  const fetchItem = useItemsStore((s) => s.fetchItem)
  const mediaType = useMediaTypesStore((s) =>
    selectedItem ? s.getMediaType(selectedItem.type) : undefined,
  )

  const [isClosing, setIsClosing] = useState(false)
  const [notesDraft, setNotesDraft] = useState(() => selectedItem?.notes ?? '')
  const [ratingDraft, setRatingDraft] = useState(() => selectedItem?.rating ?? 0)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const lastSyncedIdRef = useRef<string | null>(selectedItem?.id ?? null)

  // Re-sync local drafts whenever the selected item id changes (open or prev/next nav)
  const selectedId = selectedItem?.id ?? null
  useEffect(() => {
    if (selectedItem && lastSyncedIdRef.current !== selectedItem.id) {
      setNotesDraft(selectedItem.notes ?? '')
      setRatingDraft(selectedItem.rating)
      setConfirmingDelete(false)
      setNotesError(null)
      lastSyncedIdRef.current = selectedItem.id
    }
  }, [selectedItem, selectedId])

  // Keep ratingDraft in sync if the server changes rating (e.g. from another tab — defensive)
  useEffect(() => {
    if (selectedItem && selectedItem.id === lastSyncedIdRef.current) {
      setRatingDraft(selectedItem.rating)
    }
  }, [selectedItem])

  // Capture previously focused element and focus the panel when opened
  useEffect(() => {
    if (detailPanelOpen) {
      if (isClosing) setIsClosing(false)
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null
      requestAnimationFrame(() => panelRef.current?.focus())
    }
    // We deliberately only react to detailPanelOpen flipping; isClosing handled internally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailPanelOpen])

  // Body scroll lock while panel is open
  useEffect(() => {
    if (detailPanelOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [detailPanelOpen])

  // Computed prev/next navigation state
  const currentIndex = useMemo(
    () => (selectedItem ? items.findIndex((i) => i.id === selectedItem.id) : -1),
    [items, selectedItem],
  )
  const canPrev = currentIndex > 0
  const canNext = currentIndex >= 0 && currentIndex < items.length - 1

  const handleClose = useCallback(() => {
    setIsClosing(true)
  }, [])

  const navigatePrev = useCallback(() => {
    if (canPrev) fetchItem(items[currentIndex - 1].id)
  }, [canPrev, currentIndex, fetchItem, items])

  const navigateNext = useCallback(() => {
    if (canNext) fetchItem(items[currentIndex + 1].id)
  }, [canNext, currentIndex, fetchItem, items])

  // Keyboard handlers (Escape, Tab trap, Arrow nav)
  useEffect(() => {
    if (!detailPanelOpen) return undefined
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (confirmingDelete) {
          setConfirmingDelete(false)
        } else {
          handleClose()
        }
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        trapFocus(e, panelRef.current)
        return
      }
      if (e.key === 'ArrowLeft') {
        navigatePrev()
      } else if (e.key === 'ArrowRight') {
        navigateNext()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [detailPanelOpen, confirmingDelete, handleClose, navigatePrev, navigateNext])

  function handleAnimationEnd(e: React.AnimationEvent) {
    if (isClosing && e.target === e.currentTarget) {
      setIsClosing(false)
      setDetailPanelOpen(false)
      const prev = previouslyFocusedRef.current
      if (prev && typeof prev.focus === 'function') {
        prev.focus()
      }
      if (pendingDelete && selectedItem) {
        const id = selectedItem.id
        setPendingDelete(false)
        deleteItem(id).catch(() => {
          // Failure surfaces via items-store error state; nothing more to do here
        })
      }
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!selectedItem) return
    try {
      await updateItem(selectedItem.id, { status: newStatus })
    } catch {
      // optimistic update reverts via store; future enhancement: surface inline
    }
  }

  const handleRatingChange = useCallback(
    async (value: number) => {
      if (!selectedItem) return
      const previous = ratingDraft
      setRatingDraft(value)
      try {
        await updateItem(selectedItem.id, { rating: value })
      } catch {
        setRatingDraft(previous)
      }
    },
    [ratingDraft, selectedItem, updateItem],
  )

  async function handleNotesBlur() {
    if (!selectedItem) return
    if (isSavingNotes) return
    const trimmed = notesDraft.trim()
    const original = (selectedItem.notes ?? '').trim()
    if (trimmed === original) return
    setIsSavingNotes(true)
    setNotesError(null)
    try {
      await updateItem(selectedItem.id, { notes: trimmed })
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  function handleDeleteClick() {
    setConfirmingDelete(true)
  }

  function handleCancelDelete() {
    setConfirmingDelete(false)
  }

  function handleConfirmDelete() {
    setPendingDelete(true)
    setConfirmingDelete(false)
    setIsClosing(true)
  }

  if (!detailPanelOpen && !isClosing) return null
  if (!selectedItem) return null

  const fieldsSchema = mediaType?.fields_schema ?? []
  const creator = getCreator(selectedItem, mediaType)

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm ${
        isClosing ? styles.overlayClosing : styles.overlay
      }`}
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        className={`relative flex h-full w-[min(440px,90vw)] flex-col bg-surface-secondary shadow-lg outline-none ${
          isClosing ? styles.panelClosing : styles.panel
        }`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-edge px-5 py-3.5">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-content-muted transition-colors hover:text-content-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={navigatePrev}
              disabled={!canPrev}
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-muted transition-colors hover:text-content-primary disabled:opacity-30"
              aria-label="Previous item"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={navigateNext}
              disabled={!canNext}
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-muted transition-colors hover:text-content-primary disabled:opacity-30"
              aria-label="Next item"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Cover area */}
          <div className="mb-4 flex justify-center">
            <div className="aspect-[2/3] w-[240px] overflow-hidden rounded-lg">
              <CoverImage item={selectedItem} size="lg" />
            </div>
          </div>

          {/* Title + media type chip */}
          <div className="mb-4 text-center">
            {mediaType && (
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-content-muted">
                <span>{mediaType.icon}</span>
                <span>{mediaType.label}</span>
              </p>
            )}
            <h2
              id="detail-title"
              className="font-heading text-2xl font-semibold text-content-primary"
            >
              {selectedItem.title}
            </h2>
            {creator && <p className="mt-1 text-sm text-content-muted">{creator}</p>}
          </div>

          {/* Inline edit row: status + rating */}
          <div className="mb-4 grid grid-cols-2 gap-3 border-y border-edge py-3">
            <div>
              <label
                htmlFor="detail-status"
                className="mb-1 block text-xs font-medium text-content-secondary"
              >
                Status
              </label>
              <select
                id="detail-status"
                value={selectedItem.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-8 w-full rounded-lg border border-edge bg-surface-tertiary px-2 text-sm text-content-primary focus:border-accent focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-content-secondary">Rating</span>
              <StarRating rating={ratingDraft} size="md" onChange={handleRatingChange} />
            </div>
          </div>

          {/* Type-specific metadata (read-only) */}
          {fieldsSchema.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-content-muted">
                {mediaType?.label} Details
              </p>
              <dl className="space-y-1.5">
                {fieldsSchema.map((field) => (
                  <DetailField
                    key={field.key}
                    field={field}
                    value={selectedItem.metadata[field.key]}
                  />
                ))}
              </dl>
            </div>
          )}

          {/* Dates */}
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-content-muted">
            <div>
              <p className="font-medium text-content-secondary">Added</p>
              <p>{formatDate(selectedItem.date_added)}</p>
            </div>
            <div>
              <p className="font-medium text-content-secondary">Modified</p>
              <p>{formatDate(selectedItem.date_modified)}</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="detail-notes"
              className="mb-1 block text-xs font-medium text-content-secondary"
            >
              Notes
            </label>
            <textarea
              id="detail-notes"
              value={notesDraft}
              onChange={(e) => {
                setNotesDraft(e.target.value)
                if (notesError) setNotesError(null)
              }}
              onBlur={handleNotesBlur}
              placeholder="Add notes..."
              rows={4}
              className="w-full rounded-lg border border-edge bg-surface-tertiary px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none"
            />
            {notesError && <p className="mt-1 text-xs text-red-500">{notesError}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-edge px-5 py-3.5">
          {confirmingDelete ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-content-secondary">Delete this item?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="h-8 rounded-lg px-3 text-sm font-medium text-content-muted transition-colors hover:text-content-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-8 rounded-lg bg-red-500 px-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
                  aria-label="Confirm delete"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-red-500/40 px-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
              aria-label="Delete item"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailField({
  field,
  value,
}: {
  field: FieldDefinition
  value: unknown
}): ReactElement {
  const display = value != null && value !== '' ? String(value) : '—'
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
      <dt className="text-content-secondary">{field.label}</dt>
      <dd className="text-content-primary">{display}</dd>
    </div>
  )
}
