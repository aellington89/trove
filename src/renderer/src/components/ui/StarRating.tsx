import { memo, useState } from 'react'
import type { ReactElement } from 'react'
import { Star } from 'lucide-react'

export interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
  showEmpty?: boolean
  onChange?: (rating: number) => void
}

const SIZE_MAP = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
} as const

export const StarRating = memo(function StarRating({
  rating,
  size = 'sm',
  showEmpty = false,
  onChange,
}: StarRatingProps): ReactElement | null {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)))
  const isInteractive = typeof onChange === 'function'

  if (clamped === 0 && !showEmpty && !isInteractive) return null

  if (isInteractive) {
    return (
      <InteractiveStars
        rating={clamped}
        size={size}
        onChange={onChange}
      />
    )
  }

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

function InteractiveStars({
  rating,
  size,
  onChange,
}: {
  rating: number
  size: 'sm' | 'md'
  onChange: (rating: number) => void
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const displayRating = hoveredRating ?? rating
  const sizeClass = SIZE_MAP[size]

  return (
    <div
      className="flex gap-0.5"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHoveredRating(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= displayRating

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={starValue === rating}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            className="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-110"
            onClick={() => onChange(starValue === rating ? 0 : starValue)}
            onMouseEnter={() => setHoveredRating(starValue)}
          >
            <Star
              className={`${sizeClass} ${isFilled ? 'fill-current text-accent' : 'text-content-muted'}`}
            />
          </button>
        )
      })}
    </div>
  )
}
