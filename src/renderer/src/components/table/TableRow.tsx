import { memo, useCallback } from 'react'
import type { ReactElement, KeyboardEvent } from 'react'
import type { Item } from '../../../../shared/types'
import { useMediaTypesStore } from '../../stores'
import { formatDate } from '../../lib/format-date'
import { StarRating } from '../ui/StarRating'
import { StatusBadge } from '../ui/StatusBadge'
import type { ColumnDef } from './TableView'

export interface TableRowProps {
  item: Item
  columns: ColumnDef[]
  isSelected: boolean
  isOdd: boolean
  onClick: () => void
}

export const TableRow = memo(function TableRow({
  item,
  columns,
  isSelected,
  isOdd,
  onClick,
}: TableRowProps): ReactElement {
  const getMediaType = useMediaTypesStore((s) => s.getMediaType)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
    [onClick],
  )

  function renderCell(col: ColumnDef): ReactElement {
    switch (col.type) {
      case 'title':
        return (
          <td key={col.key} className={`px-3 py-2 ${col.width}`}>
            <span className="block truncate text-sm font-medium text-content-primary">
              {item.title}
            </span>
          </td>
        )

      case 'type': {
        const mediaType = getMediaType(item.type)
        return (
          <td key={col.key} className={`px-3 py-2 ${col.width}`}>
            <span className="text-xs text-content-secondary">
              {mediaType?.label ?? item.type}
            </span>
          </td>
        )
      }

      case 'status':
        return (
          <td key={col.key} className={`px-3 py-2 ${col.width}`}>
            <StatusBadge status={item.status} />
          </td>
        )

      case 'rating':
        return (
          <td key={col.key} className={`px-3 py-2 ${col.width}`}>
            <StarRating rating={item.rating} size="sm" />
          </td>
        )

      case 'date': {
        const value = col.key === 'date_added' ? item.date_added : item.date_modified
        return (
          <td key={col.key} className={`whitespace-nowrap px-3 py-2 ${col.width}`}>
            <span className="text-xs text-content-muted">{formatDate(value)}</span>
          </td>
        )
      }

      case 'number': {
        const val = item.metadata[col.key]
        return (
          <td key={col.key} className={`px-3 py-2 text-right ${col.width}`}>
            <span className="text-sm tabular-nums text-content-secondary">
              {val != null && val !== '' ? String(val) : '\u2014'}
            </span>
          </td>
        )
      }

      case 'text': {
        const val = item.metadata[col.key]
        return (
          <td key={col.key} className={`px-3 py-2 ${col.width}`}>
            <span className="block truncate text-sm text-content-secondary">
              {val != null && val !== '' ? String(val) : '\u2014'}
            </span>
          </td>
        )
      }
    }
  }

  return (
    <tr
      role="button"
      tabIndex={0}
      aria-label={item.title}
      className={`cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${
        isSelected
          ? 'bg-surface-active ring-2 ring-accent'
          : isOdd
            ? 'bg-surface-secondary/50 hover:bg-surface-active'
            : 'hover:bg-surface-active'
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {columns.map(renderCell)}
    </tr>
  )
})
