import type { ReactElement } from 'react'

export interface SkeletonRowProps {
  index: number
}

export function SkeletonRow({ index }: SkeletonRowProps): ReactElement {
  const base = index * 40

  return (
    <div
      className="grid grid-cols-[48px_1fr_auto_auto_auto] items-center gap-3 px-4 py-2"
      aria-hidden="true"
    >
      {/* Thumbnail */}
      <div
        className="h-12 w-12 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
        style={{ animationDelay: `${base}ms` }}
      />

      {/* Title + creator */}
      <div className="space-y-1.5">
        <div
          className="h-4 w-3/4 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${base + 80}ms` }}
        />
        <div
          className="h-3 w-1/2 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${base + 160}ms` }}
        />
      </div>

      {/* Status badge */}
      <div
        className="h-5 w-16 rounded-full bg-surface-tertiary animate-pulse motion-reduce:animate-none"
        style={{ animationDelay: `${base + 240}ms` }}
      />

      {/* Star rating */}
      <div
        className="h-3 w-16 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
        style={{ animationDelay: `${base + 320}ms` }}
      />

      {/* Date */}
      <div
        className="h-3 w-20 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none"
        style={{ animationDelay: `${base + 400}ms` }}
      />
    </div>
  )
}
