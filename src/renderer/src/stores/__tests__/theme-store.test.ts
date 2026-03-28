// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from '../theme-store'

// happy-dom doesn't implement matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('Theme Store', () => {
  beforeEach(() => {
    useThemeStore.getState()._reset()
    localStorage.clear()
  })

  describe('initial state', () => {
    it('defaults to dark theme', () => {
      expect(useThemeStore.getState().theme).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('updates theme to light', () => {
      useThemeStore.getState().setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('updates theme back to dark', () => {
      useThemeStore.getState().setTheme('light')
      useThemeStore.getState().setTheme('dark')
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('sets data-theme attribute on documentElement for light', () => {
      useThemeStore.getState().setTheme('light')
      expect(document.documentElement.dataset.theme).toBe('light')
    })

    it('removes data-theme attribute for dark', () => {
      useThemeStore.getState().setTheme('light')
      useThemeStore.getState().setTheme('dark')
      expect(document.documentElement.dataset.theme).toBeUndefined()
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('toggles from light back to dark', () => {
      useThemeStore.getState().toggleTheme()
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('updates DOM attribute on toggle', () => {
      useThemeStore.getState().toggleTheme()
      expect(document.documentElement.dataset.theme).toBe('light')

      useThemeStore.getState().toggleTheme()
      expect(document.documentElement.dataset.theme).toBeUndefined()
    })
  })

  describe('_reset', () => {
    it('restores theme to dark', () => {
      useThemeStore.getState().setTheme('light')
      useThemeStore.getState()._reset()
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('restores DOM attribute to dark state', () => {
      useThemeStore.getState().setTheme('light')
      useThemeStore.getState()._reset()
      expect(document.documentElement.dataset.theme).toBeUndefined()
    })
  })

  describe('persistence', () => {
    it('stores theme in localStorage with expected key format', () => {
      useThemeStore.getState().setTheme('light')
      const stored = JSON.parse(localStorage.getItem('trove-theme') || '{}')
      expect(stored.state.theme).toBe('light')
    })
  })
})
