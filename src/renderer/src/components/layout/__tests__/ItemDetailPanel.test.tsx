import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Item, MediaType } from '../../../../../shared/types'
import { ItemDetailPanel } from '../ItemDetailPanel'

const mockMediaType: MediaType = {
  key: 'books',
  label: 'Books',
  icon: '\uD83D\uDCDA',
  color: '#4F7942',
  fields_schema: [
    { key: 'author', label: 'Author', type: 'combobox' },
    { key: 'genre', label: 'Genre', type: 'select', options: ['Fiction', 'Non-Fiction'] },
    { key: 'pages', label: 'Pages', type: 'number' },
  ],
  is_builtin: true,
  sort_order: 1,
}

const baseItem: Item = {
  id: 'item-1',
  type: 'books',
  title: 'The Hobbit',
  status: 'Owned',
  rating: 4,
  cover_path: null,
  cover_hue: 120,
  metadata: {
    author: 'J.R.R. Tolkien',
    genre: 'Fiction',
    pages: 310,
  },
  notes: 'A delightful adventure.',
  date_added: '2026-04-01T00:00:00.000Z',
  date_modified: '2026-04-10T00:00:00.000Z',
}

const itemList: Item[] = [
  { ...baseItem, id: 'item-0', title: 'First Item' },
  baseItem,
  { ...baseItem, id: 'item-2', title: 'Last Item' },
]

// Mock CSS modules
vi.mock('../ItemDetailPanel.module.css', () => ({
  default: {
    overlay: 'overlay',
    overlayClosing: 'overlayClosing',
    panel: 'panel',
    panelClosing: 'panelClosing',
  },
}))

let mockDetailPanelOpen = true
let mockSelectedItem: Item | null = baseItem
const mockItems: Item[] = itemList

vi.mock('../../../stores', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      get detailPanelOpen() {
        return mockDetailPanelOpen
      },
      setDetailPanelOpen: () => {},
    }),
  useItemsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      get selectedItem() {
        return mockSelectedItem
      },
      get items() {
        return mockItems
      },
      updateItem: () => Promise.resolve(),
      deleteItem: () => Promise.resolve(),
      fetchItem: () => Promise.resolve(),
    }),
  useMediaTypesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      getMediaType: () => mockMediaType,
    }),
}))

function render(): string {
  return renderToStaticMarkup(<ItemDetailPanel />)
}

describe('ItemDetailPanel', () => {
  it('renders nothing when detailPanelOpen is false', () => {
    mockDetailPanelOpen = false
    mockSelectedItem = baseItem
    expect(render()).toBe('')
    mockDetailPanelOpen = true
  })

  it('renders nothing when open but selectedItem is null', () => {
    mockDetailPanelOpen = true
    mockSelectedItem = null
    expect(render()).toBe('')
    mockSelectedItem = baseItem
  })

  it('renders the panel with role="dialog" and aria-modal when open', () => {
    mockDetailPanelOpen = true
    mockSelectedItem = baseItem
    const html = render()
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('aria-labelledby="detail-title"')
  })

  it('renders Syne-font title with id="detail-title"', () => {
    const html = render()
    expect(html).toContain('id="detail-title"')
    expect(html).toContain('font-heading')
    expect(html).toContain('The Hobbit')
  })

  it('renders the media type label and icon', () => {
    const html = render()
    expect(html).toContain('Books')
    expect(html).toContain('\uD83D\uDCDA')
  })

  it('renders all 6 status options in the status select', () => {
    const html = render()
    expect(html).toContain('id="detail-status"')
    expect(html).toContain('Owned')
    expect(html).toContain('Wishlist')
    expect(html).toContain('Borrowed')
    expect(html).toContain('Lent Out')
    expect(html).toContain('Completed')
    expect(html).toContain('In Progress')
  })

  it('renders interactive star rating with role="radiogroup"', () => {
    const html = render()
    expect(html).toContain('role="radiogroup"')
  })

  it('renders type-specific metadata fields with labels and values', () => {
    const html = render()
    expect(html).toContain('Author')
    expect(html).toContain('J.R.R. Tolkien')
    expect(html).toContain('Genre')
    expect(html).toContain('Fiction')
    expect(html).toContain('Pages')
    expect(html).toContain('310')
  })

  it('renders em dash for empty metadata fields', () => {
    mockSelectedItem = { ...baseItem, metadata: {} }
    const html = render()
    // Author / Genre / Pages all empty -> three em dashes
    expect(html).toContain('—')
    mockSelectedItem = baseItem
  })

  it('renders formatted date_added and date_modified', () => {
    const html = render()
    expect(html).toContain('Added')
    expect(html).toContain('Modified')
    expect(html).toContain('Apr 1, 2026')
    expect(html).toContain('Apr 10, 2026')
  })

  it('renders notes textarea seeded with selectedItem.notes', () => {
    const html = render()
    expect(html).toContain('id="detail-notes"')
    expect(html).toContain('A delightful adventure.')
  })

  it('renders Close button with aria-label', () => {
    const html = render()
    expect(html).toContain('aria-label="Close"')
  })

  it('renders Previous and Next item buttons with aria-labels', () => {
    const html = render()
    expect(html).toContain('aria-label="Previous item"')
    expect(html).toContain('aria-label="Next item"')
  })

  it('renders Delete button with aria-label', () => {
    const html = render()
    expect(html).toContain('aria-label="Delete item"')
    expect(html).toContain('Delete')
  })

  // Helper to extract the <button> element containing the given aria-label
  function buttonContaining(html: string, ariaLabel: string): string {
    const labelIdx = html.indexOf(`aria-label="${ariaLabel}"`)
    expect(labelIdx).toBeGreaterThan(-1)
    const start = html.lastIndexOf('<button', labelIdx)
    const end = html.indexOf('</button>', labelIdx)
    return html.slice(start, end)
  }

  it('disables Previous button when current item is the first in the list', () => {
    mockSelectedItem = itemList[0]
    const html = render()
    expect(buttonContaining(html, 'Previous item')).toContain('disabled')
    mockSelectedItem = baseItem
  })

  it('disables Next button when current item is the last in the list', () => {
    mockSelectedItem = itemList[itemList.length - 1]
    const html = render()
    expect(buttonContaining(html, 'Next item')).toContain('disabled')
    mockSelectedItem = baseItem
  })

  it('disables both Previous and Next when selected item is not in items list', () => {
    mockSelectedItem = { ...baseItem, id: 'orphan' }
    const html = render()
    expect(buttonContaining(html, 'Previous item')).toContain('disabled')
    expect(buttonContaining(html, 'Next item')).toContain('disabled')
    mockSelectedItem = baseItem
  })

  it('renders the creator (first metadata field value) under the title', () => {
    const html = render()
    expect(html).toContain('J.R.R. Tolkien')
  })

  it('renders the cover area markup', () => {
    // CoverImage falls back to ProceduralCover when cover_path is null,
    // which renders an SVG with role="img" and the title in the aria-label
    const html = render()
    expect(html).toContain('role="img"')
    expect(html).toContain('Cover art for The Hobbit')
  })
})
