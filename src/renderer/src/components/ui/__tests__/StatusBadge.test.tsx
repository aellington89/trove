import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StatusBadge } from '../StatusBadge'

function render(status: string): string {
  return renderToStaticMarkup(<StatusBadge status={status} />)
}

describe('StatusBadge', () => {
  it('renders the status text', () => {
    const html = render('Owned')
    expect(html).toContain('Owned')
  })

  it('applies neutral style for Owned', () => {
    const html = render('Owned')
    expect(html).toContain('bg-surface-tertiary')
    expect(html).toContain('text-content-muted')
  })

  it('applies filled accent style for Wishlist', () => {
    const html = render('Wishlist')
    expect(html).toContain('bg-accent')
    expect(html).toContain('text-content-inverse')
  })

  it('applies info style for Borrowed', () => {
    const html = render('Borrowed')
    expect(html).toContain('text-status-info')
  })

  it('applies warning style for Lent Out', () => {
    const html = render('Lent Out')
    expect(html).toContain('text-status-warning')
  })

  it('applies success style for Completed', () => {
    const html = render('Completed')
    expect(html).toContain('text-status-success')
  })

  it('applies tinted accent style for In Progress', () => {
    const html = render('In Progress')
    expect(html).toContain('text-accent')
  })

  it('falls back to neutral style for unknown status', () => {
    const html = render('Unknown')
    expect(html).toContain('bg-surface-tertiary')
    expect(html).toContain('text-content-muted')
    expect(html).toContain('Unknown')
  })

  it('renders as a rounded pill', () => {
    const html = render('Owned')
    expect(html).toContain('rounded-full')
  })
})
