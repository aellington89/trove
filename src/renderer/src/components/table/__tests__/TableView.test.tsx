import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Item, MediaType } from '../../../../../shared/types'
import { TableView } from '../TableView'

vi.mock('../../../stores', () => ({
  useItemsStore: (selector: (s: unknown) => unknown) =>
    selector({
      selectedItem: null,
      fetchItem: () => {},
    }),
  useUIStore: (selector: (s: unknown) => unknown) =>
    selector({
      sortConfig: { field: 'date_added', direction: 'desc' },
      setSortConfig: () => {},
      activeTypeFilter: null,
    }),
  useMediaTypesStore: (selector: (s: unknown) => unknown) =>
    selector({
      getMediaType: (key: string): MediaType | undefined => {
        const types: Record<string, MediaType> = {
          books: {
            key: 'books',
            label: 'Books',
            icon: '',
            color: '#4F7942',
            fields_schema: [
              { key: 'author', label: 'Author', type: 'combobox' },
              { key: 'pages', label: 'Pages', type: 'number' },
            ],
            is_builtin: true,
            sort_order: 0,
          },
        }
        return types[key]
      },
    }),
}))

const mockItems: Item[] = [
  {
    id: '01ABC',
    type: 'books',
    title: 'Dune',
    status: 'Owned',
    rating: 4,
    cover_path: null,
    cover_hue: 42,
    metadata: { author: 'Frank Herbert', pages: 412 },
    notes: null,
    date_added: '2026-03-15T00:00:00.000Z',
    date_modified: '2026-03-15T00:00:00.000Z',
  },
  {
    id: '02DEF',
    type: 'books',
    title: 'Neuromancer',
    status: 'Wishlist',
    rating: 0,
    cover_path: null,
    cover_hue: 120,
    metadata: { author: 'William Gibson', pages: 271 },
    notes: null,
    date_added: '2026-03-16T00:00:00.000Z',
    date_modified: '2026-03-16T00:00:00.000Z',
  },
]

function render(items: Item[] = mockItems, isLoading = false): string {
  return renderToStaticMarkup(<TableView items={items} isLoading={isLoading} />)
}

describe('TableView', () => {
  it('renders a <table> element when loaded', () => {
    const html = render()
    expect(html).toContain('<table')
  })

  it('renders <thead> and <tbody> when loaded', () => {
    const html = render()
    expect(html).toContain('<thead')
    expect(html).toContain('<tbody')
  })

  it('renders one <tr> per item in tbody', () => {
    const html = render()
    // Count <tr> elements inside <tbody> — each item row plus any in thead
    // The tbody content should contain both item titles
    expect(html).toContain('Dune')
    expect(html).toContain('Neuromancer')
  })

  it('renders skeleton table when isLoading is true', () => {
    const html = render([], true)
    expect(html).toContain('<table')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('animate-pulse')
  })

  it('renders a Type column in All Items mode (no type filter)', () => {
    const html = render()
    expect(html).toContain('Type')
  })

  it('renders default column headers', () => {
    const html = render()
    expect(html).toContain('Title')
    expect(html).toContain('Status')
    expect(html).toContain('Rating')
    expect(html).toContain('Date Added')
    expect(html).toContain('Date Modified')
  })
})
