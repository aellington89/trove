import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

interface UIState {
  activeView: 'grid' | 'list' | 'table'
  activeTypeFilter: string | null
  searchQuery: string
  sortConfig: SortConfig
  sidebarCollapsed: boolean
  addModalOpen: boolean
}

interface UIActions {
  setActiveView: (view: UIState['activeView']) => void
  setActiveTypeFilter: (type: string | null) => void
  setSearchQuery: (query: string) => void
  setSortConfig: (config: SortConfig) => void
  toggleSidebar: () => void
  setAddModalOpen: (open: boolean) => void
  _reset: () => void
}

const initialState: UIState = {
  activeView: 'grid',
  activeTypeFilter: null,
  searchQuery: '',
  sortConfig: { field: 'date_added', direction: 'desc' },
  sidebarCollapsed: false,
  addModalOpen: false,
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    subscribeWithSelector((set) => ({
      ...initialState,
      setActiveView: (view) => set({ activeView: view }),
      setActiveTypeFilter: (type) => set({ activeTypeFilter: type }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortConfig: (config) => set({ sortConfig: config }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setAddModalOpen: (open) => set({ addModalOpen: open }),
      _reset: () => set(initialState),
    })),
    { name: 'UIStore' },
  ),
)
