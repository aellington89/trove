import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Item, CreateItemInput, UpdateItemInput } from '../../../../shared/types'
import { useItemsStore } from '../items-store'
import { useUIStore } from '../ui-store'

vi.mock('../../lib/trove-api')

import * as troveApi from '../../lib/trove-api'

const mockItem: Item = {
  id: '01ABC',
  type: 'books',
  title: 'The Hobbit',
  status: 'Owned',
  rating: 5,
  cover_path: null,
  cover_hue: 120,
  metadata: { author: 'J.R.R. Tolkien' },
  notes: null,
  date_added: '2026-01-01T00:00:00.000Z',
  date_modified: '2026-01-01T00:00:00.000Z',
}

const mockItem2: Item = {
  id: '01DEF',
  type: 'music',
  title: 'Abbey Road',
  status: 'Owned',
  rating: 5,
  cover_path: null,
  cover_hue: 200,
  metadata: { artist: 'The Beatles' },
  notes: null,
  date_added: '2026-01-02T00:00:00.000Z',
  date_modified: '2026-01-02T00:00:00.000Z',
}

describe('Items Store', () => {
  beforeEach(() => {
    useItemsStore.getState()._reset()
    useUIStore.getState()._reset()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useItemsStore.getState()
      expect(state.items).toEqual([])
      expect(state.total).toBe(0)
      expect(state.selectedItem).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('fetchItems', () => {
    it('fetches items with default UI filters', async () => {
      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem], total: 1 })

      await useItemsStore.getState().fetchItems()

      expect(troveApi.getItems).toHaveBeenCalledWith({
        type: undefined,
        search: undefined,
        sortBy: 'date_added',
        sortDirection: 'desc',
      })
      const state = useItemsStore.getState()
      expect(state.items).toEqual([mockItem])
      expect(state.total).toBe(1)
      expect(state.isLoading).toBe(false)
    })

    it('reads filters from UI store', async () => {
      useUIStore.getState().setActiveTypeFilter('books')
      useUIStore.getState().setSearchQuery('hobbit')
      useUIStore.getState().setSortConfig({ field: 'title', direction: 'asc' })

      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem], total: 1 })

      await useItemsStore.getState().fetchItems()

      expect(troveApi.getItems).toHaveBeenCalledWith({
        type: 'books',
        search: 'hobbit',
        sortBy: 'title',
        sortDirection: 'asc',
      })
    })

    it('sets isLoading during fetch', async () => {
      let resolvePromise: (value: { items: Item[]; total: number }) => void
      vi.mocked(troveApi.getItems).mockImplementation(
        () => new Promise((resolve) => (resolvePromise = resolve)),
      )

      const promise = useItemsStore.getState().fetchItems()
      expect(useItemsStore.getState().isLoading).toBe(true)

      resolvePromise!({ items: [], total: 0 })
      await promise
      expect(useItemsStore.getState().isLoading).toBe(false)
    })

    it('handles errors', async () => {
      vi.mocked(troveApi.getItems).mockRejectedValue(new Error('DB error'))

      await useItemsStore.getState().fetchItems()

      const state = useItemsStore.getState()
      expect(state.error).toBe('DB error')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('fetchItem', () => {
    it('sets selectedItem', async () => {
      vi.mocked(troveApi.getItem).mockResolvedValue(mockItem)

      await useItemsStore.getState().fetchItem('01ABC')

      expect(useItemsStore.getState().selectedItem).toEqual(mockItem)
    })

    it('handles errors', async () => {
      vi.mocked(troveApi.getItem).mockRejectedValue(new Error('Not found'))

      await useItemsStore.getState().fetchItem('missing')

      expect(useItemsStore.getState().error).toBe('Not found')
    })
  })

  describe('createItem', () => {
    it('creates an item and refreshes the list', async () => {
      const input: CreateItemInput = { type: 'books', title: 'New Book' }
      vi.mocked(troveApi.createItem).mockResolvedValue(mockItem)
      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem], total: 1 })

      const result = await useItemsStore.getState().createItem(input)

      expect(troveApi.createItem).toHaveBeenCalledWith(input)
      expect(result).toEqual(mockItem)
      expect(troveApi.getItems).toHaveBeenCalled()
      expect(useItemsStore.getState().items).toEqual([mockItem])
    })
  })

  describe('updateItem', () => {
    it('updates item in-place in the items array', async () => {
      // Seed the store with items
      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem, mockItem2], total: 2 })
      await useItemsStore.getState().fetchItems()

      const updated = { ...mockItem, title: 'The Hobbit (Revised)' }
      const input: UpdateItemInput = { title: 'The Hobbit (Revised)' }
      vi.mocked(troveApi.updateItem).mockResolvedValue(updated)

      const result = await useItemsStore.getState().updateItem('01ABC', input)

      expect(result.title).toBe('The Hobbit (Revised)')
      expect(useItemsStore.getState().items[0].title).toBe('The Hobbit (Revised)')
      expect(useItemsStore.getState().items[1]).toEqual(mockItem2)
    })

    it('updates selectedItem if it matches', async () => {
      vi.mocked(troveApi.getItem).mockResolvedValue(mockItem)
      await useItemsStore.getState().fetchItem('01ABC')

      // Also seed items list
      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem], total: 1 })
      await useItemsStore.getState().fetchItems()

      const updated = { ...mockItem, rating: 3 }
      vi.mocked(troveApi.updateItem).mockResolvedValue(updated)

      await useItemsStore.getState().updateItem('01ABC', { rating: 3 })

      expect(useItemsStore.getState().selectedItem?.rating).toBe(3)
    })

    it('does not touch selectedItem if ids differ', async () => {
      vi.mocked(troveApi.getItem).mockResolvedValue(mockItem2)
      await useItemsStore.getState().fetchItem('01DEF')

      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem, mockItem2], total: 2 })
      await useItemsStore.getState().fetchItems()

      const updated = { ...mockItem, rating: 1 }
      vi.mocked(troveApi.updateItem).mockResolvedValue(updated)

      await useItemsStore.getState().updateItem('01ABC', { rating: 1 })

      expect(useItemsStore.getState().selectedItem).toEqual(mockItem2)
    })
  })

  describe('deleteItem', () => {
    it('removes item from array and decrements total', async () => {
      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem, mockItem2], total: 2 })
      await useItemsStore.getState().fetchItems()

      vi.mocked(troveApi.deleteItem).mockResolvedValue({ id: '01ABC' })

      await useItemsStore.getState().deleteItem('01ABC')

      expect(useItemsStore.getState().items).toEqual([mockItem2])
      expect(useItemsStore.getState().total).toBe(1)
    })

    it('clears selectedItem if it was the deleted item', async () => {
      vi.mocked(troveApi.getItem).mockResolvedValue(mockItem)
      await useItemsStore.getState().fetchItem('01ABC')

      vi.mocked(troveApi.deleteItem).mockResolvedValue({ id: '01ABC' })

      await useItemsStore.getState().deleteItem('01ABC')

      expect(useItemsStore.getState().selectedItem).toBeNull()
    })

    it('keeps selectedItem if a different item was deleted', async () => {
      vi.mocked(troveApi.getItem).mockResolvedValue(mockItem2)
      await useItemsStore.getState().fetchItem('01DEF')

      vi.mocked(troveApi.getItems).mockResolvedValue({ items: [mockItem, mockItem2], total: 2 })
      await useItemsStore.getState().fetchItems()

      vi.mocked(troveApi.deleteItem).mockResolvedValue({ id: '01ABC' })

      await useItemsStore.getState().deleteItem('01ABC')

      expect(useItemsStore.getState().selectedItem).toEqual(mockItem2)
    })
  })
})
