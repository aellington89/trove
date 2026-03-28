import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from '../ui-store'
import { useItemsStore } from '../items-store'
import { setupStoreSubscriptions } from '../subscriptions'

vi.mock('../../lib/trove-api')

describe('Store Subscriptions', () => {
  let unsubscribe: () => void

  beforeEach(() => {
    useUIStore.getState()._reset()
    useItemsStore.getState()._reset()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    unsubscribe?.()
    vi.useRealTimers()
  })

  it('triggers fetchItems when activeTypeFilter changes', async () => {
    const fetchItemsSpy = vi.spyOn(useItemsStore.getState(), 'fetchItems').mockResolvedValue()
    unsubscribe = setupStoreSubscriptions()

    useUIStore.getState().setActiveTypeFilter('books')
    await vi.advanceTimersByTimeAsync(300)

    expect(fetchItemsSpy).toHaveBeenCalled()
  })

  it('triggers fetchItems when searchQuery changes after debounce', async () => {
    const fetchItemsSpy = vi.spyOn(useItemsStore.getState(), 'fetchItems').mockResolvedValue()
    unsubscribe = setupStoreSubscriptions()

    useUIStore.getState().setSearchQuery('tol')
    useUIStore.getState().setSearchQuery('tolk')
    useUIStore.getState().setSearchQuery('tolki')
    useUIStore.getState().setSearchQuery('tolkien')

    // Should not have fired yet (debounce)
    expect(fetchItemsSpy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)

    // Should fire only once after debounce
    expect(fetchItemsSpy).toHaveBeenCalledTimes(1)
  })

  it('triggers fetchItems when sortConfig changes', async () => {
    const fetchItemsSpy = vi.spyOn(useItemsStore.getState(), 'fetchItems').mockResolvedValue()
    unsubscribe = setupStoreSubscriptions()

    useUIStore.getState().setSortConfig({ field: 'title', direction: 'asc' })
    await vi.advanceTimersByTimeAsync(300)

    expect(fetchItemsSpy).toHaveBeenCalled()
  })

  it('does not trigger fetchItems for unrelated state changes', async () => {
    const fetchItemsSpy = vi.spyOn(useItemsStore.getState(), 'fetchItems').mockResolvedValue()
    unsubscribe = setupStoreSubscriptions()

    useUIStore.getState().setActiveView('list')
    useUIStore.getState().toggleSidebar()
    await vi.advanceTimersByTimeAsync(300)

    expect(fetchItemsSpy).not.toHaveBeenCalled()
  })

  it('stops triggering after unsubscribe', async () => {
    const fetchItemsSpy = vi.spyOn(useItemsStore.getState(), 'fetchItems').mockResolvedValue()
    unsubscribe = setupStoreSubscriptions()
    unsubscribe()

    useUIStore.getState().setActiveTypeFilter('music')
    await vi.advanceTimersByTimeAsync(300)

    expect(fetchItemsSpy).not.toHaveBeenCalled()
  })
})
