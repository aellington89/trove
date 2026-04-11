import { useCallback } from 'react'
import type { ReactElement } from 'react'
import type { Item } from '../../../../shared/types'
import { useItemsStore, useUIStore } from '../../stores'
import { ListRow } from './ListRow'
import { SkeletonRow } from './SkeletonRow'

export interface ListViewProps {
  items: Item[]
  isLoading: boolean
}

const SKELETON_COUNT = 8

export function ListView({ items, isLoading }: ListViewProps): ReactElement {
  const selectedItem = useItemsStore((s) => s.selectedItem)
  const fetchItem = useItemsStore((s) => s.fetchItem)
  const setDetailPanelOpen = useUIStore((s) => s.setDetailPanelOpen)

  const handleRowClick = useCallback(
    async (id: string) => {
      await fetchItem(id)
      if (!useItemsStore.getState().error) {
        setDetailPanelOpen(true)
      }
    },
    [fetchItem, setDetailPanelOpen]
  )

  if (isLoading) {
    return (
      <div className="flex flex-col divide-y divide-edge-subtle">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonRow key={i} index={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-edge-subtle">
      {items.map((item, index) => (
        <ListRow
          key={item.id}
          item={item}
          isSelected={selectedItem?.id === item.id}
          isOdd={index % 2 === 1}
          onClick={() => handleRowClick(item.id)}
        />
      ))}
    </div>
  )
}
