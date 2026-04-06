import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { MediaType } from '../../../../../shared/types'
import { AddItemModal } from '../AddItemModal'

const mockMediaTypes: MediaType[] = [
  {
    key: 'books',
    label: 'Books',
    icon: '\uD83D\uDCDA',
    color: '#4F7942',
    fields_schema: [
      { key: 'author', label: 'Author', type: 'combobox' },
      { key: 'genre', label: 'Genre', type: 'select', options: ['Fiction', 'Non-Fiction'] },
      { key: 'pages', label: 'Pages', type: 'number' },
      { key: 'isbn', label: 'ISBN', type: 'text' },
    ],
    is_builtin: true,
    sort_order: 1,
  },
  {
    key: 'music',
    label: 'Music',
    icon: '\uD83C\uDFB5',
    color: '#8B5CF6',
    fields_schema: [
      { key: 'artist', label: 'Artist', type: 'combobox' },
    ],
    is_builtin: true,
    sort_order: 2,
  },
]

// Mock CSS modules
vi.mock('../AddItemModal.module.css', () => ({
  default: {
    overlay: 'overlay',
    overlayClosing: 'overlayClosing',
    panel: 'panel',
    panelClosing: 'panelClosing',
  },
}))

let mockAddModalOpen = true

// Mock stores
vi.mock('../../../stores', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      get addModalOpen() { return mockAddModalOpen },
      setAddModalOpen: () => {},
      activeTypeFilter: null,
    }),
  useMediaTypesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      mediaTypes: mockMediaTypes,
    }),
  useItemsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      createItem: () => Promise.resolve(),
    }),
}))

function render(): string {
  return renderToStaticMarkup(<AddItemModal />)
}

describe('AddItemModal', () => {
  it('renders nothing when closed', () => {
    mockAddModalOpen = false
    const html = render()
    expect(html).toBe('')
    mockAddModalOpen = true
  })

  it('renders modal structure when open', () => {
    const html = render()
    expect(html).toContain('Add Item')
    expect(html).toContain('<form')
    expect(html).toContain('Save')
    expect(html).toContain('Cancel')
  })

  it('renders title input with required attribute', () => {
    const html = render()
    expect(html).toContain('id="add-title"')
    expect(html).toContain('required')
    expect(html).toContain('Enter title...')
  })

  it('renders status dropdown with all 6 options', () => {
    const html = render()
    expect(html).toContain('Owned')
    expect(html).toContain('Wishlist')
    expect(html).toContain('Borrowed')
    expect(html).toContain('Lent Out')
    expect(html).toContain('Completed')
    expect(html).toContain('In Progress')
  })

  it('renders interactive star rating with radiogroup', () => {
    const html = render()
    expect(html).toContain('role="radiogroup"')
  })

  it('renders notes textarea', () => {
    const html = render()
    expect(html).toContain('id="add-notes"')
    expect(html).toContain('Add notes...')
  })

  it('renders media type tabs with icons and labels', () => {
    const html = render()
    expect(html).toContain('\uD83D\uDCDA')
    expect(html).toContain('Books')
    expect(html).toContain('\uD83C\uDFB5')
    expect(html).toContain('Music')
  })

  it('renders tabs with role="tab" and aria-selected', () => {
    const html = render()
    expect(html).toContain('role="tab"')
    expect(html).toContain('aria-selected="true"')
  })

  it('renders type-specific fields for the selected type', () => {
    const html = render()
    // Books is selected by default (first type)
    expect(html).toContain('Author')
    expect(html).toContain('Genre')
    expect(html).toContain('Pages')
    expect(html).toContain('ISBN')
  })

  it('renders select field with options', () => {
    const html = render()
    expect(html).toContain('Fiction')
    expect(html).toContain('Non-Fiction')
    expect(html).toContain('Select...')
  })

  it('renders number input for number fields', () => {
    const html = render()
    expect(html).toContain('type="number"')
  })

  it('renders text input for text and combobox fields', () => {
    const html = render()
    // Author (combobox) and ISBN (text) render as text inputs
    expect(html).toContain('id="add-field-author"')
    expect(html).toContain('id="add-field-isbn"')
  })

  it('has close button with aria-label', () => {
    const html = render()
    expect(html).toContain('aria-label="Close"')
  })

  it('renders media type section heading', () => {
    const html = render()
    expect(html).toContain('Books Details')
  })

  it('has tablist role on media type tabs container', () => {
    const html = render()
    expect(html).toContain('role="tablist"')
  })
})
