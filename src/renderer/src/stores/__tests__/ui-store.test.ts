import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../ui-store'

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.getState()._reset()
  })

  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useUIStore.getState()
      expect(state.activeView).toBe('grid')
      expect(state.activeTypeFilter).toBeNull()
      expect(state.searchQuery).toBe('')
      expect(state.sortConfig).toEqual({ field: 'date_added', direction: 'desc' })
      expect(state.sidebarCollapsed).toBe(false)
    })
  })

  describe('setActiveView', () => {
    it('updates the active view', () => {
      useUIStore.getState().setActiveView('list')
      expect(useUIStore.getState().activeView).toBe('list')

      useUIStore.getState().setActiveView('table')
      expect(useUIStore.getState().activeView).toBe('table')
    })
  })

  describe('setActiveTypeFilter', () => {
    it('sets a type filter', () => {
      useUIStore.getState().setActiveTypeFilter('books')
      expect(useUIStore.getState().activeTypeFilter).toBe('books')
    })

    it('clears the type filter with null', () => {
      useUIStore.getState().setActiveTypeFilter('books')
      useUIStore.getState().setActiveTypeFilter(null)
      expect(useUIStore.getState().activeTypeFilter).toBeNull()
    })
  })

  describe('setSearchQuery', () => {
    it('updates the search query', () => {
      useUIStore.getState().setSearchQuery('tolkien')
      expect(useUIStore.getState().searchQuery).toBe('tolkien')
    })
  })

  describe('setSortConfig', () => {
    it('updates sort config', () => {
      const config = { field: 'title', direction: 'asc' as const }
      useUIStore.getState().setSortConfig(config)
      expect(useUIStore.getState().sortConfig).toEqual(config)
    })
  })

  describe('toggleSidebar', () => {
    it('flips the collapsed state', () => {
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('_reset', () => {
    it('restores all state to defaults', () => {
      useUIStore.getState().setActiveView('table')
      useUIStore.getState().setActiveTypeFilter('music')
      useUIStore.getState().setSearchQuery('bach')
      useUIStore.getState().setSortConfig({ field: 'title', direction: 'asc' })
      useUIStore.getState().toggleSidebar()

      useUIStore.getState()._reset()

      const state = useUIStore.getState()
      expect(state.activeView).toBe('grid')
      expect(state.activeTypeFilter).toBeNull()
      expect(state.searchQuery).toBe('')
      expect(state.sortConfig).toEqual({ field: 'date_added', direction: 'desc' })
      expect(state.sidebarCollapsed).toBe(false)
    })
  })
})
