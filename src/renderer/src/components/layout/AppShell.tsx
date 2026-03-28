import { useRef, useEffect } from 'react'
import { useUIStore } from '../../stores'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MainContent } from './MainContent'

export function AppShell() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const isNarrow = useMediaQuery('(max-width: 1279px)')
  const prevIsNarrow = useRef(isNarrow)

  // Auto-collapse/expand on breakpoint crossing
  useEffect(() => {
    if (isNarrow && !prevIsNarrow.current && !sidebarCollapsed) {
      toggleSidebar()
    }
    if (!isNarrow && prevIsNarrow.current && sidebarCollapsed) {
      toggleSidebar()
    }
    prevIsNarrow.current = isNarrow
  }, [isNarrow, sidebarCollapsed, toggleSidebar])

  return (
    <div className="flex h-screen bg-surface-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <MainContent />
      </div>
    </div>
  )
}
