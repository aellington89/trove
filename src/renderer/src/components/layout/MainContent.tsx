import { useItemsStore, useUIStore } from '../../stores'

export function MainContent() {
  const items = useItemsStore((s) => s.items)
  const isLoading = useItemsStore((s) => s.isLoading)
  const activeTypeFilter = useUIStore((s) => s.activeTypeFilter)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const activeView = useUIStore((s) => s.activeView)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-edge border-t-accent" />
          <p className="text-sm text-content-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    const message = searchQuery
      ? `No items matching "${searchQuery}"`
      : activeTypeFilter
        ? 'No items in this category yet'
        : 'Your library is empty'

    const hint = searchQuery ? 'Try a different search term' : 'Add your first item to get started'

    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-content-secondary">{message}</p>
          <p className="mt-1 text-sm text-content-muted">{hint}</p>
        </div>
      </div>
    )
  }

  // Placeholder content until Grid/List/Table views are implemented (Issues #1.8–1.10)
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="text-sm text-content-muted">
        {items.length} item{items.length !== 1 ? 's' : ''} &middot;{' '}
        {activeView.charAt(0).toUpperCase() + activeView.slice(1)} view
      </p>
    </div>
  )
}
