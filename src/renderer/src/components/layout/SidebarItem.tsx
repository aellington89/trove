import styles from './Sidebar.module.css'

interface SidebarItemProps {
  icon: string
  label: string
  count: number
  color?: string
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}

export function SidebarItem({
  icon,
  label,
  count,
  color,
  isActive,
  isCollapsed,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-surface-active text-content-primary'
          : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
      }`}
      style={
        isActive && color ? { borderLeft: `3px solid ${color}`, paddingLeft: '9px' } : undefined
      }
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">{icon}</span>
      <span
        className={`${styles.itemLabel} ${isCollapsed ? styles.itemLabelHidden : ''} flex-1 text-left`}
      >
        {label}
      </span>
      <span
        className={`${styles.itemLabel} ${isCollapsed ? styles.itemLabelHidden : ''} text-xs text-content-muted`}
      >
        {count}
      </span>
    </button>
  )
}
