import { useCallback } from 'react'
import type { ReactElement, KeyboardEvent } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import type { ColumnDef } from './TableView'
import type { SortConfig } from '../../stores/ui-store'

export interface TableHeaderProps {
  columns: ColumnDef[]
  sortConfig: SortConfig
  onSort: (field: string) => void
}

export function TableHeader({ columns, sortConfig, onSort }: TableHeaderProps): ReactElement {
  const handleKeyDown = useCallback(
    (field: string) => (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSort(field)
      }
    },
    [onSort],
  )

  return (
    <thead className="sticky top-0 z-10 bg-surface-primary">
      <tr className="border-b border-edge">
        {columns.map((col) => {
          const isActive = sortConfig.field === col.key
          const ariaSortValue = !col.sortable
            ? undefined
            : isActive
              ? sortConfig.direction === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'

          return (
            <th
              key={col.key}
              scope="col"
              aria-sort={ariaSortValue}
              tabIndex={col.sortable ? 0 : undefined}
              className={`whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wider ${col.width} ${
                col.align === 'right' ? 'text-right' : 'text-left'
              } ${
                col.sortable
                  ? 'cursor-pointer select-none transition-colors hover:text-content-primary'
                  : ''
              } ${isActive ? 'text-accent' : 'text-content-secondary'}`}
              onClick={col.sortable ? () => onSort(col.key) : undefined}
              onKeyDown={col.sortable ? handleKeyDown(col.key) : undefined}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {isActive &&
                  (sortConfig.direction === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  ))}
              </span>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
