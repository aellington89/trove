import { Library, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMediaTypesStore, useUIStore, useItemsStore } from '../../stores'
import { SidebarItem } from './SidebarItem'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const mediaTypes = useMediaTypesStore((s) => s.mediaTypes)
  const activeTypeFilter = useUIStore((s) => s.activeTypeFilter)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const setActiveTypeFilter = useUIStore((s) => s.setActiveTypeFilter)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const itemCounts = useItemsStore((s) => s.itemCounts)

  const builtinTypes = mediaTypes.filter((mt) => mt.is_builtin)
  const customTypes = mediaTypes.filter((mt) => !mt.is_builtin)

  const totalCount = Object.values(itemCounts).reduce((sum, c) => sum + c, 0)

  return (
    <aside
      className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} flex h-full flex-col border-r border-edge bg-surface-secondary`}
    >
      {/* Header */}
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2 border-b border-edge px-3">
        <Library className="h-5 w-5 shrink-0 text-accent" />
        <span
          className={`${styles.itemLabel} ${sidebarCollapsed ? styles.itemLabelHidden : ''} font-heading text-lg font-semibold text-content-primary`}
        >
          Trove
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* All Items */}
        <SidebarItem
          icon="📋"
          label="All Items"
          count={totalCount}
          isActive={activeTypeFilter === null}
          isCollapsed={sidebarCollapsed}
          onClick={() => setActiveTypeFilter(null)}
        />

        {/* Built-in types */}
        <div className="mt-3 flex flex-col gap-0.5">
          {builtinTypes.map((mt) => (
            <SidebarItem
              key={mt.key}
              icon={mt.icon}
              label={mt.label}
              count={itemCounts[mt.key] ?? 0}
              color={mt.color}
              isActive={activeTypeFilter === mt.key}
              isCollapsed={sidebarCollapsed}
              onClick={() => setActiveTypeFilter(mt.key)}
            />
          ))}
        </div>

        {/* Custom types (if any) */}
        {customTypes.length > 0 && (
          <>
            <div className="my-3 border-t border-edge" />
            <div className="flex flex-col gap-0.5">
              {customTypes.map((mt) => (
                <SidebarItem
                  key={mt.key}
                  icon={mt.icon}
                  label={mt.label}
                  count={itemCounts[mt.key] ?? 0}
                  color={mt.color}
                  isActive={activeTypeFilter === mt.key}
                  isCollapsed={sidebarCollapsed}
                  onClick={() => setActiveTypeFilter(mt.key)}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-10 shrink-0 items-center justify-center border-t border-edge text-content-muted transition-colors hover:text-content-primary"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  )
}
