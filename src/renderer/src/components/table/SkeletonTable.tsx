import type { ReactElement } from 'react'
import type { ColumnDef } from './TableView'

export interface SkeletonTableProps {
  columns: ColumnDef[]
}

const SKELETON_COUNT = 10

export function SkeletonTable({ columns }: SkeletonTableProps): ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[768px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface-primary">
          <tr className="border-b border-edge">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wider text-content-secondary ${col.width} ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-subtle" aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }, (_, rowIndex) => {
            const base = rowIndex * 40
            return (
              <tr key={rowIndex} className={rowIndex % 2 === 1 ? 'bg-surface-secondary/50' : ''}>
                {columns.map((col, colIndex) => (
                  <td key={col.key} className={`px-3 py-2 ${col.width}`}>
                    <div
                      className={`h-4 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none ${
                        col.type === 'title'
                          ? 'w-3/4'
                          : col.type === 'status'
                            ? 'h-5 w-16 rounded-full'
                            : col.type === 'rating'
                              ? 'w-16'
                              : col.type === 'number'
                                ? 'ml-auto w-10'
                                : 'w-20'
                      }`}
                      style={{ animationDelay: `${base + colIndex * 40}ms` }}
                    />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
