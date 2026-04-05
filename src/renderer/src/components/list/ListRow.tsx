import { memo, useCallback } from 'react'
import type { ReactElement, KeyboardEvent } from 'react'
import type { Item } from '../../../../shared/types'
import { useMediaTypesStore } from '../../stores'
import { getCreator } from '../../lib/get-creator'
import { formatDate } from '../../lib/format-date'
import { CoverImage } from '../grid/CoverImage'
import { StarRating } from '../ui/StarRating'
import { StatusBadge } from '../ui/StatusBadge'

export interface ListRowProps {
  item: Item
  isSelected: boolean
  isOdd: boolean
  onClick: () => void
}

export const ListRow = memo(function ListRow({
  item,
  isSelected,
  isOdd,
  onClick,
}: ListRowProps): ReactElement {
  const mediaType = useMediaTypesStore((s) => s.getMediaType(item.type))
  const creator = getCreator(item, mediaType)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
    [onClick]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.title}${creator ? ` by ${creator}` : ''}`}
      className={`grid min-h-[56px] cursor-pointer grid-cols-[48px_1fr_auto_auto_auto] items-center gap-3 px-4 py-2 transition-colors duration-150 motion-reduce:transition-none ${
        isSelected
          ? 'bg-surface-active ring-2 ring-accent'
          : isOdd
            ? 'bg-surface-secondary/50 hover:bg-surface-active'
            : 'hover:bg-surface-active'
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 overflow-hidden rounded">
        <CoverImage item={item} size="xs" />
      </div>

      {/* Title + Creator */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-content-primary">{item.title}</p>
        {creator && (
          <p className="mt-0.5 truncate text-xs text-content-muted">{creator}</p>
        )}
      </div>

      {/* Status */}
      <StatusBadge status={item.status} />

      {/* Rating */}
      <StarRating rating={item.rating} size="sm" />

      {/* Date added */}
      <span className="text-xs text-content-muted whitespace-nowrap">
        {formatDate(item.date_added)}
      </span>
    </div>
  )
})
