import { describe, it, expect } from 'vitest'
import { formatDate } from '../format-date'

describe('formatDate', () => {
  it('formats an ISO date string as "Mon DD, YYYY"', () => {
    expect(formatDate('2026-03-15T00:00:00.000Z')).toBe('Mar 15, 2026')
  })

  it('formats a start-of-year date', () => {
    expect(formatDate('2026-01-01T00:00:00.000Z')).toBe('Jan 1, 2026')
  })

  it('formats an end-of-year date', () => {
    expect(formatDate('2026-12-31T23:59:59.999Z')).toBe('Dec 31, 2026')
  })

  it('formats a leap day', () => {
    expect(formatDate('2028-02-29T12:00:00.000Z')).toBe('Feb 29, 2028')
  })
})
