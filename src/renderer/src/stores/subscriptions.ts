import { shallow } from 'zustand/shallow'
import { useUIStore } from './ui-store'
import { useItemsStore } from './items-store'

export function setupStoreSubscriptions(): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const unsubscribe = useUIStore.subscribe(
    (state) => ({
      activeTypeFilter: state.activeTypeFilter,
      searchQuery: state.searchQuery,
      sortConfig: state.sortConfig,
    }),
    () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        useItemsStore.getState().fetchItems()
      }, 300)
    },
    { equalityFn: shallow },
  )

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    unsubscribe()
  }
}
