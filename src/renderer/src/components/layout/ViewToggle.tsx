import { LayoutGrid, List, Table2 } from 'lucide-react'
import { useUIStore } from '../../stores'

const views = [
  { key: 'grid' as const, icon: LayoutGrid, label: 'Grid view' },
  { key: 'list' as const, icon: List, label: 'List view' },
  { key: 'table' as const, icon: Table2, label: 'Table view' },
]

export function ViewToggle() {
  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)

  return (
    <div
      className="flex items-center rounded-lg border border-edge"
      role="group"
      aria-label="View mode"
    >
      {views.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setActiveView(key)}
          title={label}
          aria-pressed={activeView === key}
          className={`flex h-8 w-8 items-center justify-center transition-colors ${
            activeView === key
              ? 'bg-surface-active text-content-primary'
              : 'text-content-muted hover:text-content-secondary'
          } ${key === 'grid' ? 'rounded-l-lg' : key === 'table' ? 'rounded-r-lg' : ''}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
