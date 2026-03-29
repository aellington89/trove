import { describe, it, expect } from 'vitest'
import { djb2, computeCoverHue } from '../hash'

describe('djb2', () => {
  it('returns consistent values for the same input', () => {
    expect(djb2('hello')).toBe(djb2('hello'))
    expect(djb2('The Great Gatsby')).toBe(djb2('The Great Gatsby'))
  })

  it('returns different values for different inputs', () => {
    expect(djb2('hello')).not.toBe(djb2('world'))
    expect(djb2('Dune')).not.toBe(djb2('Dune 2'))
  })

  it('handles an empty string', () => {
    expect(djb2('')).toBe(5381)
  })

  it('handles a single character', () => {
    const result = djb2('a')
    expect(typeof result).toBe('number')
    expect(Number.isFinite(result)).toBe(true)
  })

  it('handles a very long string', () => {
    const long = 'a'.repeat(10_000)
    const result = djb2(long)
    expect(typeof result).toBe('number')
    expect(Number.isFinite(result)).toBe(true)
    expect(djb2(long)).toBe(result)
  })
})

describe('computeCoverHue', () => {
  it('returns a value in the range 0–359', () => {
    const titles = ['Dune', 'The Great Gatsby', '1984', '', 'x', 'a'.repeat(500)]
    for (const title of titles) {
      const hue = computeCoverHue(title)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })

  it('is deterministic — same title always produces the same hue', () => {
    expect(computeCoverHue('Neuromancer')).toBe(computeCoverHue('Neuromancer'))
  })

  it('produces different hues for different titles', () => {
    const hues = new Set(
      ['Dune', 'Neuromancer', '1984', 'Hamlet', 'Moby Dick'].map(computeCoverHue),
    )
    expect(hues.size).toBeGreaterThan(1)
  })
})
