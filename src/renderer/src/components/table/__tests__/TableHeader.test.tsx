import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TableHeader } from '../TableHeader'
import type { ColumnDef } from '../TableView'

const columns: ColumnDef[] = [
  { key: 'title', label: 'Title', type: 'title', sortable: true, width: 'min-w-[200px]', align: 'left' },
  { key: 'status', label: 'Status', type: 'status', sortable: true, width: 'w-[110px]', align: 'left' },
  { key: 'rating', label: 'Rating', type: 'rating', sortable: true, width: 'w-[100px]', align: 'left' },
  { key: 'date_added', label: 'Date Added', type: 'date', sortable: true, width: 'w-[120px]', align: 'left' },
]

function render(
  sortConfig = { field: 'title', direction: 'asc' as const },
  cols = columns
): string {
  return renderToStaticMarkup(
    <table>
      <TableHeader columns={cols} sortConfig={sortConfig} onSort={() => {}} />
    </table>
  )
}

describe('TableHeader', () => {
  it('renders all column labels as <th> elements', () => {
    const html = render()
    expect(html).toContain('<th')
    expect(html).toContain('Title')
    expect(html).toContain('Status')
    expect(html).toContain('Rating')
    expect(html).toContain('Date Added')
  })

  it('renders aria-sort="ascending" on the active asc sort column', () => {
    const html = render({ field: 'title', direction: 'asc' })
    expect(html).toContain('aria-sort="ascending"')
  })

  it('renders aria-sort="descending" on the active desc sort column', () => {
    const html = render({ field: 'title', direction: 'desc' })
    expect(html).toContain('aria-sort="descending"')
  })

  it('renders aria-sort="none" on non-active sortable columns', () => {
    const html = render({ field: 'title', direction: 'asc' })
    // Status, Rating, and Date Added should all have aria-sort="none"
    const noneCount = (html.match(/aria-sort="none"/g) || []).length
    expect(noneCount).toBe(3)
  })

  it('sortable columns have tabindex="0"', () => {
    const html = render()
    const tabIndexCount = (html.match(/tabindex="0"/g) || []).length
    expect(tabIndexCount).toBe(columns.length)
  })

  it('active sort column shows an arrow SVG icon', () => {
    const html = render({ field: 'title', direction: 'asc' })
    expect(html).toContain('<svg')
  })

  it('renders inside a <thead> element', () => {
    const html = render()
    expect(html).toContain('<thead')
  })

  it('applies accent color to active sort column', () => {
    const html = render({ field: 'rating', direction: 'desc' })
    expect(html).toContain('text-accent')
  })
})
