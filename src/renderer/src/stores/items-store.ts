import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Item, CreateItemInput, UpdateItemInput, ItemFilter } from '../../../shared/types'
import * as troveApi from '../lib/trove-api'
import { useUIStore } from './ui-store'

interface ItemsState {
  items: Item[]
  total: number
  itemCounts: Record<string, number>
  selectedItem: Item | null
  isLoading: boolean
  error: string | null
}

interface ItemsActions {
  fetchItems: () => Promise<void>
  fetchItem: (id: string) => Promise<void>
  fetchItemCounts: () => Promise<void>
  createItem: (data: CreateItemInput) => Promise<Item>
  updateItem: (id: string, data: UpdateItemInput) => Promise<Item>
  deleteItem: (id: string) => Promise<void>
  _reset: () => void
}

const initialState: ItemsState = {
  items: [],
  total: 0,
  itemCounts: {},
  selectedItem: null,
  isLoading: false,
  error: null,
}

export const useItemsStore = create<ItemsState & ItemsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchItems: async () => {
        set({ isLoading: true, error: null })
        try {
          const { activeTypeFilter, searchQuery, sortConfig } = useUIStore.getState()
          const filter: ItemFilter = {
            type: activeTypeFilter ?? undefined,
            search: searchQuery || undefined,
            sortBy: sortConfig.field,
            sortDirection: sortConfig.direction,
          }
          const result = await troveApi.getItems(filter)
          set({ items: result.items, total: result.total, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch items',
            isLoading: false,
          })
        }
      },

      fetchItemCounts: async () => {
        try {
          const itemCounts = await troveApi.getItemCounts()
          set({ itemCounts })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch item counts',
          })
        }
      },

      fetchItem: async (id) => {
        try {
          const item = await troveApi.getItem(id)
          set({ selectedItem: item })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch item',
          })
        }
      },

      createItem: async (data) => {
        const item = await troveApi.createItem(data)
        await get().fetchItems()
        await get().fetchItemCounts()
        return item
      },

      updateItem: async (id, data) => {
        const updated = await troveApi.updateItem(id, data)
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? updated : item)),
          selectedItem: state.selectedItem?.id === id ? updated : state.selectedItem,
        }))
        return updated
      },

      deleteItem: async (id) => {
        await troveApi.deleteItem(id)
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          total: state.total - 1,
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        }))
        await get().fetchItemCounts()
      },

      _reset: () => set(initialState),
    }),
    { name: 'ItemsStore' },
  ),
)
