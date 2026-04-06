import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Item, MediaType } from '../../../../../shared/types'
import { TableRow } from '../TableRow'
import type { ColumnDef } from '../TableView'

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
  metadata: { author: 'Frank Herbert', pages: 412 },
  notes: null,
  date_added: '2026-03-15T00:00:00.000Z',
  date_modified: '2026-03-15T00:00:00.000Z',
}

const defaultColumns: ColumnDef[] = [
  { key: 'title', label: 'Title', type: 'title', sortable: true, width: 'min-w-[200px]', align: 'left' },
  { key: 'status', label: 'Status', type: 'status', sortable: true, width: 'w-[110px]', align: 'left' },
  { key: 'rating', label: 'Rating', type: 'rating', sortable: true, width: 'w-[100px]', align: 'left' },
  { key: 'date_added', label: 'Date Added', type: 'date', sortable: true, width: 'w-[120px]', align: 'left' },
  { key: 'date_modified', label: 'Date Modified', type: 'date', sortable: true, width: 'w-[120px]', align: 'left' },
]

const columnsWithType: ColumnDef[] = [
  defaultColumns[0],
  { key: 'type', label: 'Type', type: 'type', sortable: true, width: 'w-[100px]', align: 'left' },
  ...defaultColumns.slice(1),
]

const columnsWithMetadata: ColumnDef[] = [
  ...defaultColumns,
  { key: 'author', label: 'Author', type: 'text', sortable: true, width: 'min-w-[120px] max-w-[200px]', align: 'left' },
  { key: 'pages', label: 'Pages', type: 'number', sortable: true, width: 'w-[90px]', align: 'right' },
]

function render(
  item: Item = mockItem,
  columns: ColumnDef[] = defaultColumns,
  overrides: Partial<{ isSelected: boolean; isOdd: boolean }> = {}
): string {
  return renderToStaticMarkup(
    <table>
      <tbody>
        <TableRow
          item={item}
          columns={columns}
          isSelected={overrides.isSelected ?? false}
          isOdd={overrides.isOdd ?? false}
          onClick={() => {}}
        />
      </tbody>
    </table>
  )
}

describe('TableRow', () => {
  it('renders the item title', () => {
    const html = render()
    expect(html).toContain('Dune')
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

  it('renders formatted dates', () => {
    const html = render()
    expect(html).toContain('Mar 15, 2026')
  })

  it('renders metadata text values when metadata columns present', () => {
    const html = render(mockItem, columnsWithMetadata)
    expect(html).toContain('Frank Herbert')
  })

  it('renders metadata number values when metadata columns present', () => {
    const html = render(mockItem, columnsWithMetadata)
    expect(html).toContain('412')
  })

  it('renders em dash for missing metadata keys', () => {
    const item = { ...mockItem, metadata: {} }
    const html = render(item, columnsWithMetadata)
    expect(html).toContain('\u2014')
  })

  it('renders type label when Type column present', () => {
    const html = render(mockItem, columnsWithType)
    expect(html).toContain('Books')
  })

  it('has role="button" for accessibility', () => {
    const html = render()
    expect(html).toContain('role="button"')
  })

  it('has tabindex="0" for keyboard focus', () => {
    const html = render()
    expect(html).toContain('tabindex="0"')
  })

  it('has an aria-label with the item title', () => {
    const html = render()
    expect(html).toContain('aria-label="Dune"')
  })

  it('applies selected styling when isSelected is true', () => {
    const html = render(mockItem, defaultColumns, { isSelected: true })
    expect(html).toContain('ring-accent')
    expect(html).toContain('bg-surface-active')
  })

  it('applies alternating row background when isOdd is true', () => {
    const html = render(mockItem, defaultColumns, { isOdd: true })
    expect(html).toContain('bg-surface-secondary/50')
  })

  it('renders different status badges correctly', () => {
    const wishlistItem = { ...mockItem, status: 'Wishlist' }
    const html = render(wishlistItem)
    expect(html).toContain('Wishlist')
    expect(html).toContain('bg-accent')
  })
})
