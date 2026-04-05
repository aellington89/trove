import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Item, MediaType } from '../../../../../shared/types'
import { ListRow } from '../ListRow'

// Mock the media types store (same pattern as ItemCard tests)
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
  date_added: '2026-03-15T00:00:00.000Z',
  date_modified: '2026-03-15T00:00:00.000Z',
}

function render(
  item: Item = mockItem,
  overrides: Partial<{ isSelected: boolean; isOdd: boolean }> = {}
): string {
  return renderToStaticMarkup(
    <ListRow
      item={item}
      isSelected={overrides.isSelected ?? false}
      isOdd={overrides.isOdd ?? false}
      onClick={() => {}}
    />
  )
}

describe('ListRow', () => {
  it('renders the item title', () => {
    const html = render()
    expect(html).toContain('Dune')
  })

  it('renders the creator from metadata', () => {
    const html = render()
    expect(html).toContain('Frank Herbert')
  })

  it('renders the status badge', () => {
    const html = render()
    expect(html).toContain('Owned')
    expect(html).toContain('rounded-full')
  })

  it('renders star rating when rating > 0', () => {
    const html = render()
    expect(html).toContain('Rating: 4 out of 5 stars')
  })

  it('does not render star rating markup when rating is 0', () => {
    const html = render({ ...mockItem, rating: 0 })
    expect(html).not.toContain('Rating:')
  })

  it('renders the formatted date', () => {
    const html = render()
    expect(html).toContain('Mar 15, 2026')
  })

  it('renders a cover thumbnail', () => {
    const html = render()
    expect(html).toContain('<svg')
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

  it('applies selected styling when isSelected is true', () => {
    const html = render(mockItem, { isSelected: true })
    expect(html).toContain('ring-accent')
    expect(html).toContain('bg-surface-active')
  })

  it('applies alternating row background when isOdd is true', () => {
    const html = render(mockItem, { isOdd: true })
    expect(html).toContain('bg-surface-secondary/50')
  })

  it('renders different status badges correctly', () => {
    const wishlistItem = { ...mockItem, status: 'Wishlist' }
    const html = render(wishlistItem)
    expect(html).toContain('Wishlist')
    expect(html).toContain('bg-accent')
  })

  it('omits creator when metadata is empty', () => {
    const item = { ...mockItem, metadata: {} }
    const html = render(item)
    expect(html).not.toContain('Frank Herbert')
    expect(html).toContain('aria-label="Dune"')
  })
})
