import { memo } from 'react'
import type { ReactElement } from 'react'
import { djb2 } from '../../../../shared/hash'
import { getMotif } from './motifs'
import { layoutTitle } from './text-layout'

export interface ProceduralCoverProps {
  title: string
  type: string
  hue: number
  size: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: { width: 120, height: 180 },
  md: { width: 160, height: 240 },
  lg: { width: 240, height: 360 },
} as const

const ProceduralCover = memo(function ProceduralCover({
  title,
  type,
  hue,
  size,
}: ProceduralCoverProps): ReactElement {
  const seed = djb2(title)
  const { width, height } = SIZE_MAP[size]
  const bgColor = `hsl(${hue}, 25%, 12%)`
  const textColor = `hsl(${hue}, 30%, 85%)`
  const motifElements = getMotif(type, hue, seed)
  const { lines, fontSize } = layoutTitle(title)

  // Position title text in the lower portion of the cover
  const textStartY = 230
  const lineHeight = fontSize * 1.3

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Cover art for ${title}`}
    >
      <rect width="200" height="300" fill={bgColor} rx="4" />
      {motifElements}
      <text
        fontFamily="'Syne', sans-serif"
        fontWeight={600}
        fontSize={fontSize}
        fill={textColor}
        textAnchor="middle"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={100} y={textStartY + i * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  )
})

export { ProceduralCover }
