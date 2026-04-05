import { useCallback } from 'react'
import type { ReactElement } from 'react'
import type { Item } from '../../../../shared/types'
import { useItemsStore } from '../../stores'
import { ItemCard } from './ItemCard'
import { SkeletonCard } from './SkeletonCard'

export interface GridViewProps {
  items: Item[]
  isLoading: boolean
}

const SKELETON_COUNT = 12

export function GridView({ items, isLoading }: GridViewProps): ReactElement {
  const selectedItem = useItemsStore((s) => s.selectedItem)
  const fetchItem = useItemsStore((s) => s.fetchItem)

  const handleCardClick = useCallback(
    (id: string) => {
      fetchItem(id)
    },
    [fetchItem]
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 p-4">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 p-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isSelected={selectedItem?.id === item.id}
          onClick={() => handleCardClick(item.id)}
        />
      ))}
    </div>
  )
}
