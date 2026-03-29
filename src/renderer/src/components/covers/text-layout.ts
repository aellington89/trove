/** Approximate characters per line at a given font size inside a 200-unit-wide viewBox. */
const CHARS_PER_LINE = 18

const MAX_LINES = 3

interface TitleLayout {
  lines: string[]
  fontSize: number
}

/**
 * Word-wraps and sizes a title for display inside a 200×300 SVG cover.
 * Returns the wrapped lines and an appropriate font size.
 */
export function layoutTitle(title: string): TitleLayout {
  const trimmed = title.trim()
  if (trimmed.length === 0) return { lines: [], fontSize: 16 }

  // Scale font size based on title length
  let fontSize: number
  if (trimmed.length <= 10) fontSize = 18
  else if (trimmed.length <= 20) fontSize = 16
  else if (trimmed.length <= 40) fontSize = 14
  else fontSize = 12

  const words = trimmed.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (lines.length >= MAX_LINES) break

    // Truncate a single word that exceeds a line
    const truncated = word.length > CHARS_PER_LINE ? word.slice(0, CHARS_PER_LINE - 1) + '…' : word

    if (current.length === 0) {
      current = truncated
    } else if (current.length + 1 + truncated.length <= CHARS_PER_LINE) {
      current += ' ' + truncated
    } else {
      lines.push(current)
      if (lines.length >= MAX_LINES) break
      current = truncated
    }
  }

  // Push final line (may need truncation + ellipsis if we hit the limit)
  if (current.length > 0 && lines.length < MAX_LINES) {
    lines.push(current)
  } else if (current.length > 0 && lines.length === MAX_LINES) {
    // Words remain but no room — add ellipsis to last line
    const last = lines[MAX_LINES - 1]
    if (last.length + 1 <= CHARS_PER_LINE) {
      lines[MAX_LINES - 1] = last + '…'
    } else {
      lines[MAX_LINES - 1] = last.slice(0, CHARS_PER_LINE - 1) + '…'
    }
  }

  return { lines, fontSize }
}
