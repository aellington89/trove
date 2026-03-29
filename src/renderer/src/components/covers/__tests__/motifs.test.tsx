import { describe, it, expect } from 'vitest'
import { getMotif } from '../motifs'

describe('getMotif', () => {
  const hue = 200
  const seed = 123456

  it('returns non-empty elements for each built-in type', () => {
    for (const type of ['books', 'music', 'movies', 'tv', 'games']) {
      const elements = getMotif(type, hue, seed)
      expect(elements.length).toBeGreaterThan(0)
    }
  })

  it('books motif contains rect elements (horizontal lines)', () => {
    const elements = getMotif('books', hue, seed)
    expect(elements.every((el) => el.type === 'rect')).toBe(true)
  })

  it('music motif contains circle elements (concentric circles)', () => {
    const elements = getMotif('music', hue, seed)
    expect(elements.every((el) => el.type === 'circle')).toBe(true)
  })

  it('movies motif contains rect elements (film frames and sprockets)', () => {
    const elements = getMotif('movies', hue, seed)
    expect(elements.every((el) => el.type === 'rect')).toBe(true)
  })

  it('tv motif contains rect elements (screen grid)', () => {
    const elements = getMotif('tv', hue, seed)
    expect(elements.every((el) => el.type === 'rect')).toBe(true)
  })

  it('games motif contains rect elements (pixel grid)', () => {
    const elements = getMotif('games', hue, seed)
    expect(elements.every((el) => el.type === 'rect')).toBe(true)
  })

  it('returns default motif for unknown types', () => {
    const elements = getMotif('podcasts', hue, seed)
    expect(elements.length).toBeGreaterThan(0)
    // Default motif uses circles
    expect(elements.every((el) => el.type === 'circle')).toBe(true)
  })

  it('returns default motif for custom types', () => {
    const elements = getMotif('vinyl-records', hue, seed)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('is deterministic — same inputs produce the same output', () => {
    const a = getMotif('books', hue, seed)
    const b = getMotif('books', hue, seed)
    expect(a.length).toBe(b.length)
    for (let i = 0; i < a.length; i++) {
      expect(a[i].key).toBe(b[i].key)
      expect(a[i].props).toEqual(b[i].props)
    }
  })
})
