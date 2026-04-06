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

  describe('interactive mode (onChange provided)', () => {
    const noop = () => {}

    it('renders 5 buttons when onChange is provided', () => {
      const html = render({ rating: 3, onChange: noop })
      const buttonCount = (html.match(/<button/g) || []).length
      expect(buttonCount).toBe(5)
    })

    it('uses radiogroup role on container', () => {
      const html = render({ rating: 2, onChange: noop })
      expect(html).toContain('role="radiogroup"')
    })

    it('uses radio role on each star button', () => {
      const html = render({ rating: 1, onChange: noop })
      const radioCount = (html.match(/role="radio"/g) || []).length
      expect(radioCount).toBe(5)
    })

    it('marks the current rating star as aria-checked', () => {
      const html = render({ rating: 3, onChange: noop })
      const checkedCount = (html.match(/aria-checked="true"/g) || []).length
      expect(checkedCount).toBe(1)
    })

    it('has aria-label on each star button', () => {
      const html = render({ rating: 0, onChange: noop })
      expect(html).toContain('aria-label="1 star"')
      expect(html).toContain('aria-label="2 stars"')
      expect(html).toContain('aria-label="5 stars"')
    })

    it('always shows all 5 stars even at rating 0', () => {
      const html = render({ rating: 0, onChange: noop })
      const buttonCount = (html.match(/<button/g) || []).length
      expect(buttonCount).toBe(5)
    })

    it('renders 3 filled and 2 unfilled stars for rating 3', () => {
      const html = render({ rating: 3, onChange: noop })
      const filledCount = (html.match(/fill-current/g) || []).length
      const mutedCount = (html.match(/text-content-muted/g) || []).length
      expect(filledCount).toBe(3)
      expect(mutedCount).toBe(2)
    })

    it('has container aria-label "Rating"', () => {
      const html = render({ rating: 0, onChange: noop })
      expect(html).toContain('aria-label="Rating"')
    })
  })
})
