import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Item, MediaType } from '../../../../../shared/types'
import { ItemCard } from '../ItemCard'

// Mock the media types store
vi.mock('../../../stores', () => ({
  useMediaTypesStore: (selector: (s: unknown) => unknown) =>
    selector({
      getMediaType: (key: string): MediaType | undefined => {
        const types: Record<string, MediaType> = {
          books: {
            key: 'books',
            label: 'Books',
            icon: '',
            color: '#4F7942',
            fields_schema: [{ key: 'author', label: 'Author', type: 'combobox' }],
            is_builtin: true,
            sort_order: 0,
          },
          music: {
            key: 'music',
            label: 'Music',
            icon: '',
            color: '#8B5CF6',
            fields_schema: [{ key: 'artist', label: 'Artist', type: 'combobox' }],
            is_builtin: true,
            sort_order: 1,
          },
        }
        return types[key]
      },
    }),
}))

const mockItem: Item = {
  id: '01ABC',
  type: 'books',
  title: 'Dune',
  status: 'Owned',
  rating: 4,
  cover_path: null,
  cover_hue: 42,
  metadata: { author: 'Frank Herbert' },
  notes: null,
  date_added: '2026-01-01T00:00:00.000Z',
  date_modified: '2026-01-01T00:00:00.000Z',
}

function render(item: Item = mockItem, isSelected = false): string {
  return renderToStaticMarkup(
    <ItemCard item={item} isSelected={isSelected} onClick={() => {}} />
  )
}

describe('ItemCard', () => {
  it('renders the item title', () => {
    const html = render()
    expect(html).toContain('Dune')
  })

  it('renders the creator from metadata', () => {
    const html = render()
    expect(html).toContain('Frank Herbert')
  })

  it('renders star rating when rating > 0', () => {
    const html = render()
    expect(html).toContain('Rating: 4 out of 5 stars')
  })

  it('does not render star rating when rating is 0', () => {
    const html = render({ ...mockItem, rating: 0 })
    expect(html).not.toContain('Rating:')
  })

  it('renders ProceduralCover when cover_path is null', () => {
    const html = render()
    expect(html).toContain('<svg')
    expect(html).toContain('Cover art for Dune')
  })

  it('has role="button" for accessibility', () => {
    const html = render()
    expect(html).toContain('role="button"')
  })

  it('has tabindex="0" for keyboard focus', () => {
    const html = render()
    expect(html).toContain('tabindex="0"')
  })

  it('has an aria-label with title and creator', () => {
    const html = render()
    expect(html).toContain('aria-label="Dune by Frank Herbert"')
  })

  it('renders a long title without error', () => {
    const longTitle = 'The Incredibly Long and Winding Title That Never Ends And Keeps Going On'
    const html = render({ ...mockItem, title: longTitle })
    expect(html).toContain(longTitle)
  })

  it('applies selected styling when isSelected is true', () => {
    const html = render(mockItem, true)
    expect(html).toContain('ring-accent')
  })

  it('omits creator in aria-label when no creator exists', () => {
    const item = { ...mockItem, metadata: {} }
    const html = render(item)
    expect(html).toContain('aria-label="Dune"')
    expect(html).not.toContain('by')
  })
})
