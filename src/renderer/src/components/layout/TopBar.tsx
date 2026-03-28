import { Search, X, Plus, Sun } from 'lucide-react'
import { useUIStore } from '../../stores'
import { ViewToggle } from './ViewToggle'
import { SortDropdown } from './SortDropdown'

export function TopBar() {
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)

  return (
    <header className="flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-edge bg-surface-primary px-4">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search library..."
          className="h-8 w-full max-w-xs rounded-lg border border-edge bg-surface-tertiary pl-8 pr-8 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted transition-colors hover:text-content-primary"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* View toggles */}
      <ViewToggle />

      {/* Sort dropdown */}
      <SortDropdown />

      {/* Add button */}
      <button
        className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        title="Add item"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Item</span>
      </button>

      {/* Theme toggle (no-op until Issue #1.6) */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:text-content-primary"
        title="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </button>
    </header>
  )
}
