import { memo } from 'react'
import type { ReactElement } from 'react'
import { Star } from 'lucide-react'

export interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
  showEmpty?: boolean
}

const SIZE_MAP = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
} as const

export const StarRating = memo(function StarRating({
  rating,
  size = 'sm',
  showEmpty = false,
}: StarRatingProps): ReactElement | null {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)))

  if (clamped === 0 && !showEmpty) return null

  const sizeClass = SIZE_MAP[size]
  const stars: ReactElement[] = []

  for (let i = 0; i < 5; i++) {
    if (i < clamped) {
      stars.push(
        <Star key={i} className={`${sizeClass} fill-current text-accent`} />
      )
    } else {
      stars.push(
        <Star key={i} className={`${sizeClass} text-content-muted`} />
      )
    }
  }

  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${clamped} out of 5 stars`} role="img">
      {stars}
    </div>
  )
})
