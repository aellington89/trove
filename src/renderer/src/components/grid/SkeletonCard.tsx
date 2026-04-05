import type { ReactElement } from 'react'

export interface SkeletonCardProps {
  index: number
}

export function SkeletonCard({ index }: SkeletonCardProps): ReactElement {
  return (
    <div
      className="rounded-lg bg-surface-card ring-1 ring-edge-subtle"
      aria-hidden="true"
    >
      {/* Cover area */}
      <div
        className="aspect-[2/3] rounded-t-lg bg-surface-tertiary animate-pulse motion-reduce:animate-none"
        style={{ animationDelay: `${index * 50}ms` }}
      />

      {/* Info area */}
      <div className="px-2.5 pb-2.5 pt-2 space-y-2">
        <div
          className="h-4 w-3/4 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${index * 50 + 100}ms` }}
        />
        <div
          className="h-3 w-1/2 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${index * 50 + 200}ms` }}
        />
        <div
          className="h-3 w-1/3 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${index * 50 + 300}ms` }}
        />
      </div>
    </div>
  )
}
