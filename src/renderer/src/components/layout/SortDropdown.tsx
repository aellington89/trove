import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useUIStore } from '../../stores'
import type { SortConfig } from '../../stores/ui-store'

const sortFields = [
  { value: 'title', label: 'Title' },
  { value: 'date_added', label: 'Date Added' },
  { value: 'rating', label: 'Rating' },
  { value: 'date_modified', label: 'Date Modified' },
]

export function SortDropdown() {
  const sortConfig = useUIStore((s) => s.sortConfig)
  const setSortConfig = useUIStore((s) => s.setSortConfig)
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const activeLabel = sortFields.find((f) => f.value === sortConfig.field)?.label ?? 'Sort'

  const close = useCallback(() => {
    setIsOpen(false)
    setFocusedIndex(-1)
  }, [])

  // Click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, close])

  const selectField = (value: string) => {
    setSortConfig({ field: value, direction: sortConfig.direction })
    close()
  }

  const toggleDirection = () => {
    const newDir: SortConfig['direction'] = sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ field: sortConfig.field, direction: newDir })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((i) => (i + 1) % sortFields.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => (i - 1 + sortFields.length) % sortFields.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) {
          selectField(sortFields[focusedIndex].value)
        }
        break
    }
  }

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const option = listRef.current.children[focusedIndex] as HTMLElement
      option?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  return (
    <div ref={containerRef} className="relative flex items-center gap-0.5">
      {/* Sort field button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-8 items-center gap-1.5 rounded-l-lg border border-edge px-2.5 text-xs text-content-secondary transition-colors hover:border-edge-hover hover:text-content-primary"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>{activeLabel}</span>
      </button>

      {/* Direction toggle */}
      <button
        onClick={toggleDirection}
        title={sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'}
        className="flex h-8 w-8 items-center justify-center rounded-r-lg border border-l-0 border-edge text-content-muted transition-colors hover:border-edge-hover hover:text-content-primary"
      >
        {sortConfig.direction === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Sort by"
          className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-edge bg-surface-secondary py-1 shadow-lg"
        >
          {sortFields.map((field, index) => (
            <li
              key={field.value}
              role="option"
              aria-selected={sortConfig.field === field.value}
              className={`cursor-pointer px-3 py-1.5 text-xs transition-colors ${
                sortConfig.field === field.value
                  ? 'text-accent'
                  : focusedIndex === index
                    ? 'bg-surface-tertiary text-content-primary'
                    : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
              }`}
              onClick={() => selectField(field.value)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {field.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
