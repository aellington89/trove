import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StarRating } from '../StarRating'

function render(props: React.ComponentProps<typeof StarRating>): string {
  return renderToStaticMarkup(<StarRating {...props} />)
}

describe('StarRating', () => {
  it('returns nothing for rating 0', () => {
    const html = render({ rating: 0 })
    expect(html).toBe('')
  })

  it('renders 3 filled and 2 unfilled stars for rating 3', () => {
    const html = render({ rating: 3 })
    const filledCount = (html.match(/fill-current/g) || []).length
    const mutedCount = (html.match(/text-content-muted/g) || []).length
    expect(filledCount).toBe(3)
    expect(mutedCount).toBe(2)
  })

  it('renders 5 filled stars for rating 5', () => {
    const html = render({ rating: 5 })
    const filledCount = (html.match(/fill-current/g) || []).length
    const mutedCount = (html.match(/text-content-muted/g) || []).length
    expect(filledCount).toBe(5)
    expect(mutedCount).toBe(0)
  })

  it('renders 5 unfilled stars when rating 0 and showEmpty true', () => {
    const html = render({ rating: 0, showEmpty: true })
    const filledCount = (html.match(/fill-current/g) || []).length
    const mutedCount = (html.match(/text-content-muted/g) || []).length
    expect(filledCount).toBe(0)
    expect(mutedCount).toBe(5)
  })

  it('has correct aria-label', () => {
    const html = render({ rating: 4 })
    expect(html).toContain('aria-label="Rating: 4 out of 5 stars"')
  })

  it('has role="img"', () => {
    const html = render({ rating: 3 })
    expect(html).toContain('role="img"')
  })

  it('clamps rating above 5 to 5', () => {
    const html = render({ rating: 7 })
    const filledCount = (html.match(/fill-current/g) || []).length
    expect(filledCount).toBe(5)
    expect(html).toContain('Rating: 5 out of 5 stars')
  })

  it('clamps negative rating to 0 and returns nothing', () => {
    const html = render({ rating: -1 })
    expect(html).toBe('')
  })

  it('uses sm size classes by default', () => {
    const html = render({ rating: 1 })
    expect(html).toContain('h-3 w-3')
  })

  it('uses md size classes when specified', () => {
    const html = render({ rating: 1, size: 'md' })
    expect(html).toContain('h-4 w-4')
  })
})
