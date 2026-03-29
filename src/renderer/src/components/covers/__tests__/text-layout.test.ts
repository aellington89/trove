import { describe, it, expect } from 'vitest'
import { layoutTitle } from '../text-layout'

describe('layoutTitle', () => {
  it('returns a single line and base font size for short titles', () => {
    const result = layoutTitle('Dune')
    expect(result.lines).toEqual(['Dune'])
    expect(result.fontSize).toBe(18)
  })

  it('wraps long titles to multiple lines', () => {
    const result = layoutTitle('The Lord of the Rings: The Fellowship of the Ring')
    expect(result.lines.length).toBeGreaterThan(1)
  })

  it('reduces font size for longer titles', () => {
    const short = layoutTitle('Dune')
    const long = layoutTitle('A Very Long Title That Keeps Going And Going Further')
    expect(long.fontSize).toBeLessThan(short.fontSize)
  })

  it('enforces a maximum of 3 lines', () => {
    const result = layoutTitle(
      'This is a very long title that should definitely need more than three lines to display properly in a small cover',
    )
    expect(result.lines.length).toBeLessThanOrEqual(3)
  })

  it('truncates very long single words with ellipsis', () => {
    const result = layoutTitle('Supercalifragilisticexpialidocious')
    expect(result.lines[0]).toContain('…')
  })

  it('handles empty string gracefully', () => {
    const result = layoutTitle('')
    expect(result.lines).toEqual([])
    expect(result.fontSize).toBe(16)
  })

  it('handles whitespace-only string', () => {
    const result = layoutTitle('   ')
    expect(result.lines).toEqual([])
  })
})
