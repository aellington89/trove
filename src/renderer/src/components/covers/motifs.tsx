import type { ReactElement } from 'react'

// ─── Seed Helpers ────────────────────────────────────────────────────────────

/** Derive a pseudo-random value in [min, max] from a seed + index. */
function seeded(seed: number, index: number, min: number, max: number): number {
  const n = Math.abs(((seed * 2654435761 + index * 2246822519) | 0) >>> 0)
  return min + (n % (max - min + 1))
}

function accentColor(hue: number, lightness = 55): string {
  return `hsl(${hue}, 60%, ${lightness}%)`
}

function accentColorDim(hue: number): string {
  return `hsl(${hue}, 40%, 30%)`
}

// ─── Motif Generators ────────────────────────────────────────────────────────

function booksMotif(hue: number, seed: number): ReactElement[] {
  const count = seeded(seed, 0, 6, 10)
  const elements: ReactElement[] = []
  const totalHeight = 170
  const gap = 4
  const barHeight = (totalHeight - (count - 1) * gap) / count
  const startY = 20

  for (let i = 0; i < count; i++) {
    const width = seeded(seed, i + 1, 80, 170)
    const x = seeded(seed, i + 10, 15, 200 - width - 15)
    const lightness = seeded(seed, i + 20, 40, 65)
    elements.push(
      <rect
        key={`book-${i}`}
        x={x}
        y={startY + i * (barHeight + gap)}
        width={width}
        height={barHeight}
        rx={2}
        fill={accentColor(hue, lightness)}
        opacity={0.8}
      />,
    )
  }
  return elements
}

function musicMotif(hue: number, seed: number): ReactElement[] {
  const count = seeded(seed, 0, 5, 8)
  const elements: ReactElement[] = []
  const cx = 100
  const cy = 110
  const maxR = 70

  for (let i = 0; i < count; i++) {
    const r = maxR - i * (maxR / count)
    const strokeWidth = seeded(seed, i + 1, 1, 4)
    const lightness = seeded(seed, i + 10, 40, 65)
    elements.push(
      <circle
        key={`ring-${i}`}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={accentColor(hue, lightness)}
        strokeWidth={strokeWidth}
        opacity={0.7}
      />,
    )
  }

  // Spindle
  elements.push(<circle key="spindle" cx={cx} cy={cy} r={6} fill={accentColor(hue)} />)
  return elements
}

function moviesMotif(hue: number, seed: number): ReactElement[] {
  const elements: ReactElement[] = []

  // Sprocket holes — left column
  for (let i = 0; i < 10; i++) {
    elements.push(
      <rect
        key={`spr-l-${i}`}
        x={8}
        y={10 + i * 20}
        width={10}
        height={12}
        rx={2}
        fill={accentColorDim(hue)}
      />,
    )
  }

  // Sprocket holes — right column
  for (let i = 0; i < 10; i++) {
    elements.push(
      <rect
        key={`spr-r-${i}`}
        x={182}
        y={10 + i * 20}
        width={10}
        height={12}
        rx={2}
        fill={accentColorDim(hue)}
      />,
    )
  }

  // Frames
  const frameCount = seeded(seed, 0, 3, 4)
  const frameGap = 8
  const totalH = 190
  const frameH = (totalH - (frameCount - 1) * frameGap) / frameCount

  for (let i = 0; i < frameCount; i++) {
    const lightness = seeded(seed, i + 5, 40, 60)
    elements.push(
      <rect
        key={`frame-${i}`}
        x={28}
        y={12 + i * (frameH + frameGap)}
        width={144}
        height={frameH}
        rx={3}
        fill={accentColor(hue, lightness)}
        opacity={0.6}
      />,
    )
  }

  return elements
}

function tvMotif(hue: number, seed: number): ReactElement[] {
  const cols = seeded(seed, 0, 2, 3)
  const rows = seeded(seed, 1, 2, 3)
  const elements: ReactElement[] = []
  const gap = 8
  const padX = 20
  const padY = 20
  const areaW = 200 - padX * 2
  const areaH = 180 - padY
  const cellW = (areaW - (cols - 1) * gap) / cols
  const cellH = (areaH - (rows - 1) * gap) / rows
  const activeIdx = seeded(seed, 2, 0, cols * rows - 1)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      const isActive = idx === activeIdx
      const lightness = isActive ? 65 : seeded(seed, idx + 10, 35, 50)
      elements.push(
        <rect
          key={`tv-${r}-${c}`}
          x={padX + c * (cellW + gap)}
          y={padY + r * (cellH + gap)}
          width={cellW}
          height={cellH}
          rx={4}
          fill={accentColor(hue, lightness)}
          opacity={isActive ? 0.95 : 0.5}
        />,
      )
    }
  }

  return elements
}

function gamesMotif(hue: number, seed: number): ReactElement[] {
  const gridSize = 6
  const elements: ReactElement[] = []
  const pad = 25
  const areaSize = 150
  const cellSize = areaSize / gridSize
  const gap = 2

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const lit = seeded(seed, r * gridSize + c, 0, 3) > 0 // ~75% chance lit
      if (!lit) continue
      const lightness = seeded(seed, r * gridSize + c + 50, 40, 65)
      elements.push(
        <rect
          key={`px-${r}-${c}`}
          x={pad + c * cellSize + gap / 2}
          y={pad + r * cellSize + gap / 2}
          width={cellSize - gap}
          height={cellSize - gap}
          fill={accentColor(hue, lightness)}
          opacity={0.8}
        />,
      )
    }
  }

  return elements
}

function defaultMotif(hue: number, seed: number): ReactElement[] {
  const elements: ReactElement[] = []
  const count = seeded(seed, 0, 8, 14)

  for (let i = 0; i < count; i++) {
    const cx = seeded(seed, i * 3 + 1, 25, 175)
    const cy = seeded(seed, i * 3 + 2, 20, 190)
    const r = seeded(seed, i * 3 + 3, 6, 18)
    const lightness = seeded(seed, i + 50, 40, 65)
    elements.push(
      <circle
        key={`dot-${i}`}
        cx={cx}
        cy={cy}
        r={r}
        fill={accentColor(hue, lightness)}
        opacity={0.6}
      />,
    )
  }

  return elements
}

// ─── Public API ──────────────────────────────────────────────────────────────

const motifMap: Record<string, (hue: number, seed: number) => ReactElement[]> = {
  books: booksMotif,
  music: musicMotif,
  movies: moviesMotif,
  tv: tvMotif,
  games: gamesMotif,
}

export function getMotif(type: string, hue: number, seed: number): ReactElement[] {
  const generator = motifMap[type] ?? defaultMotif
  return generator(hue, seed)
}
