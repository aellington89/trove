import { describe, it, expect } from 'vitest'
import type { Item, MediaType } from '../../../../shared/types'
import { getCreator } from '../get-creator'

const makeItem = (metadata: Record<string, unknown> = {}): Item => ({
  id: '01ABC',
  type: 'books',
  title: 'Dune',
  status: 'Owned',
  rating: 0,
  cover_path: null,
  cover_hue: null,
  metadata,
  notes: null,
  date_added: '2026-01-01T00:00:00.000Z',
  date_modified: '2026-01-01T00:00:00.000Z',
})

const makeMediaType = (key: string, fields: { key: string; label: string }[]): MediaType => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  icon: '',
  color: '#000',
  fields_schema: fields.map((f) => ({ ...f, type: 'combobox' as const })),
  is_builtin: true,
  sort_order: 0,
})

describe('getCreator', () => {
  it('returns author for a books item', () => {
    const item = makeItem({ author: 'Frank Herbert' })
    const mt = makeMediaType('books', [{ key: 'author', label: 'Author' }])
    expect(getCreator(item, mt)).toBe('Frank Herbert')
  })

  it('returns artist for a music item', () => {
    const item = makeItem({ artist: 'Radiohead' })
    const mt = makeMediaType('music', [{ key: 'artist', label: 'Artist' }])
    expect(getCreator(item, mt)).toBe('Radiohead')
  })

  it('returns director for a movies item', () => {
    const item = makeItem({ director: 'Denis Villeneuve' })
    const mt = makeMediaType('movies', [{ key: 'director', label: 'Director' }])
    expect(getCreator(item, mt)).toBe('Denis Villeneuve')
  })

  it('returns null when mediaType is undefined', () => {
    const item = makeItem({ author: 'Frank Herbert' })
    expect(getCreator(item, undefined)).toBeNull()
  })

  it('returns null when fields_schema is empty', () => {
    const item = makeItem({ author: 'Frank Herbert' })
    const mt = makeMediaType('custom', [])
    expect(getCreator(item, mt)).toBeNull()
  })

  it('returns null when metadata is empty', () => {
    const item = makeItem({})
    const mt = makeMediaType('books', [{ key: 'author', label: 'Author' }])
    expect(getCreator(item, mt)).toBeNull()
  })

  it('returns null when metadata value is an empty string', () => {
    const item = makeItem({ author: '' })
    const mt = makeMediaType('books', [{ key: 'author', label: 'Author' }])
    expect(getCreator(item, mt)).toBeNull()
  })

  it('returns null when metadata value is not a string', () => {
    const item = makeItem({ author: 42 })
    const mt = makeMediaType('books', [{ key: 'author', label: 'Author' }])
    expect(getCreator(item, mt)).toBeNull()
  })
})
