import { memo } from 'react'
import type { ReactElement } from 'react'

export interface StatusBadgeProps {
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  Owned: 'bg-surface-tertiary text-content-muted',
  Wishlist: 'bg-accent text-content-inverse',
  Borrowed: 'bg-status-info/15 text-status-info',
  'Lent Out': 'bg-status-warning/15 text-status-warning',
  Completed: 'bg-status-success/15 text-status-success',
  'In Progress': 'bg-accent/15 text-accent',
}

const FALLBACK_STYLE = 'bg-surface-tertiary text-content-muted'

export const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps): ReactElement {
  const colorClasses = STATUS_STYLES[status] ?? FALLBACK_STYLE

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${colorClasses}`}
    >
      {status}
    </span>
  )
})
