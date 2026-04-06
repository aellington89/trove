import { useItemsStore, useUIStore } from '../../stores'
import { GridView } from '../grid/GridView'
import { ListView } from '../list/ListView'
import { TableView } from '../table/TableView'

export function MainContent() {
  const items = useItemsStore((s) => s.items)
  const isLoading = useItemsStore((s) => s.isLoading)
  const activeTypeFilter = useUIStore((s) => s.activeTypeFilter)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const activeView = useUIStore((s) => s.activeView)

  // Grid and list views handle their own loading skeletons
  if (isLoading && activeView === 'grid') {
    return (
      <div className="flex-1 overflow-y-auto">
        <GridView items={[]} isLoading={true} />
      </div>
    )
  }

  if (isLoading && activeView === 'list') {
    return (
      <div className="flex-1 overflow-y-auto">
        <ListView items={[]} isLoading={true} />
      </div>
    )
  }

  if (isLoading && activeView === 'table') {
    return (
      <div className="flex-1 overflow-y-auto">
        <TableView items={[]} isLoading={true} />
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

  // Grid view
  if (activeView === 'grid') {
    return (
      <div className="flex-1 overflow-y-auto">
        <GridView items={items} isLoading={false} />
      </div>
    )
  }

  // List view
  if (activeView === 'list') {
    return (
      <div className="flex-1 overflow-y-auto">
        <ListView items={items} isLoading={false} />
      </div>
    )
  }

  // Table view
  return (
    <div className="flex-1 overflow-y-auto">
      <TableView items={items} isLoading={false} />
    </div>
  )
}
