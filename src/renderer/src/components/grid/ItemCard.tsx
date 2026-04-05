import { memo, useCallback } from 'react'
import type { ReactElement, KeyboardEvent } from 'react'
import type { Item } from '../../../../shared/types'
import { useMediaTypesStore } from '../../stores'
import { getCreator } from '../../lib/get-creator'
import { CoverImage } from './CoverImage'
import { StarRating } from '../ui/StarRating'

export interface ItemCardProps {
  item: Item
  isSelected: boolean
  onClick: () => void
}

export const ItemCard = memo(function ItemCard({
  item,
  isSelected,
  onClick,
}: ItemCardProps): ReactElement {
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
      className={`group cursor-pointer rounded-lg bg-surface-card transition-[transform,box-shadow] duration-200 motion-reduce:transition-none ${
        isSelected
          ? 'ring-2 ring-accent'
          : 'ring-1 ring-edge-subtle hover:-translate-y-1 hover:shadow-hover-lift motion-reduce:hover:translate-y-0'
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {/* Cover art area */}
      <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
        <CoverImage item={item} />
      </div>

      {/* Info area */}
      <div className="px-2.5 pb-2.5 pt-2">
        <p className="truncate text-sm font-medium text-content-primary">{item.title}</p>
        {creator && (
          <p className="mt-0.5 truncate text-xs text-content-muted">{creator}</p>
        )}
        {item.rating > 0 && (
          <div className="mt-1">
            <StarRating rating={item.rating} size="sm" />
          </div>
        )}
      </div>
    </div>
  )
})
