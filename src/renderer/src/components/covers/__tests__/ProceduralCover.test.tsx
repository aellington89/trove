import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProceduralCover } from '../ProceduralCover'

function render(props: React.ComponentProps<typeof ProceduralCover>): string {
  return renderToStaticMarkup(<ProceduralCover {...props} />)
}

describe('ProceduralCover', () => {
  const baseProps = { title: 'Dune', type: 'books', hue: 42, size: 'md' as const }

  it('renders an svg element', () => {
    const html = render(baseProps)
    expect(html).toContain('<svg')
    expect(html).toContain('</svg>')
  })

  it.each([
    ['sm', 120, 180],
    ['md', 160, 240],
    ['lg', 240, 360],
  ] as const)('renders correct dimensions for size "%s"', (size, w, h) => {
    const html = render({ ...baseProps, size })
    expect(html).toContain(`width="${w}"`)
    expect(html).toContain(`height="${h}"`)
  })

  it('contains the title text', () => {
    const html = render(baseProps)
    expect(html).toContain('Dune')
  })

  it('is deterministic — same props produce identical output', () => {
    const a = render(baseProps)
    const b = render(baseProps)
    expect(a).toBe(b)
  })

  it('produces different output for different titles', () => {
    const a = render({ ...baseProps, title: 'Dune' })
    const b = render({ ...baseProps, title: 'Neuromancer' })
    expect(a).not.toBe(b)
  })

  it('produces different motifs for different media types', () => {
    const books = render({ ...baseProps, type: 'books' })
    const music = render({ ...baseProps, type: 'music' })
    expect(books).not.toBe(music)
  })

  it('renders a default motif for unknown types', () => {
    const html = render({ ...baseProps, type: 'vinyl-records' })
    expect(html).toContain('<svg')
    expect(html).toContain('<circle')
  })

  it('has role="img" for accessibility', () => {
    const html = render(baseProps)
    expect(html).toContain('role="img"')
  })

  it('has an aria-label', () => {
    const html = render(baseProps)
    expect(html).toContain('aria-label="Cover art for Dune"')
  })

  it('handles an empty title', () => {
    const html = render({ ...baseProps, title: '' })
    expect(html).toContain('<svg')
  })

  it('handles a very long title without error', () => {
    const longTitle =
      'The Incredibly Long and Winding Title of a Book That Never Ends And Keeps Going'
    const html = render({ ...baseProps, title: longTitle })
    expect(html).toContain('<svg')
  })
})
