import { useMemo, useCallback } from 'react'
import type { ReactElement } from 'react'
import type { Item, FieldDefinition } from '../../../../shared/types'
import { useItemsStore, useUIStore, useMediaTypesStore } from '../../stores'
import type { SortConfig } from '../../stores/ui-store'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { SkeletonTable } from './SkeletonTable'

// ─── Column Definition ──────────────────────────────────────────────────────

export interface ColumnDef {
  key: string
  label: string
  type: 'title' | 'type' | 'status' | 'rating' | 'date' | 'text' | 'number'
  sortable: boolean
  width: string
  align: 'left' | 'right'
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'title', label: 'Title', type: 'title', sortable: true, width: 'min-w-[200px]', align: 'left' },
  { key: 'status', label: 'Status', type: 'status', sortable: true, width: 'w-[110px]', align: 'left' },
  { key: 'rating', label: 'Rating', type: 'rating', sortable: true, width: 'w-[100px]', align: 'left' },
  { key: 'date_added', label: 'Date Added', type: 'date', sortable: true, width: 'w-[120px]', align: 'left' },
  { key: 'date_modified', label: 'Date Modified', type: 'date', sortable: true, width: 'w-[120px]', align: 'left' },
]

const TYPE_COLUMN: ColumnDef = {
  key: 'type',
  label: 'Type',
  type: 'type',
  sortable: true,
  width: 'w-[100px]',
  align: 'left',
}

function fieldToColumn(field: FieldDefinition): ColumnDef {
  const isNumber = field.type === 'number'
  return {
    key: field.key,
    label: field.label,
    type: isNumber ? 'number' : 'text',
    sortable: true,
    width: isNumber ? 'w-[90px]' : 'min-w-[120px] max-w-[200px]',
    align: isNumber ? 'right' : 'left',
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export interface TableViewProps {
  items: Item[]
  isLoading: boolean
}

export function TableView({ items, isLoading }: TableViewProps): ReactElement {
  const sortConfig = useUIStore((s) => s.sortConfig)
  const setSortConfig = useUIStore((s) => s.setSortConfig)
  const activeTypeFilter = useUIStore((s) => s.activeTypeFilter)
  const selectedItem = useItemsStore((s) => s.selectedItem)
  const fetchItem = useItemsStore((s) => s.fetchItem)
  const getMediaType = useMediaTypesStore((s) => s.getMediaType)

  const columns = useMemo<ColumnDef[]>(() => {
    const [titleCol, ...rest] = DEFAULT_COLUMNS

    if (!activeTypeFilter) {
      return [titleCol, TYPE_COLUMN, ...rest]
    }

    const mediaType = getMediaType(activeTypeFilter)
    if (!mediaType) {
      return DEFAULT_COLUMNS
    }

    const metadataColumns = mediaType.fields_schema.map(fieldToColumn)
    return [...DEFAULT_COLUMNS, ...metadataColumns]
  }, [activeTypeFilter, getMediaType])

  const handleSort = useCallback(
    (field: string) => {
      if (sortConfig.field === field) {
        const newDir: SortConfig['direction'] = sortConfig.direction === 'asc' ? 'desc' : 'asc'
        setSortConfig({ field, direction: newDir })
      } else {
        setSortConfig({ field, direction: 'asc' })
      }
    },
    [sortConfig, setSortConfig],
  )

  const handleRowClick = useCallback(
    (id: string) => {
      fetchItem(id)
    },
    [fetchItem],
  )

  if (isLoading) {
    return <SkeletonTable columns={columns} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[768px] border-collapse text-sm">
        <TableHeader columns={columns} sortConfig={sortConfig} onSort={handleSort} />
        <tbody className="divide-y divide-edge-subtle">
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              item={item}
              columns={columns}
              isSelected={selectedItem?.id === item.id}
              isOdd={index % 2 === 1}
              onClick={() => handleRowClick(item.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
