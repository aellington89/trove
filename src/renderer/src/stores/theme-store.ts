import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light'

interface ThemeState {
  theme: ThemeMode
}

interface ThemeActions {
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  _reset: () => void
}

const initialState: ThemeState = {
  theme: 'dark',
}

function applyThemeToDOM(theme: ThemeMode): void {
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light'
  } else {
    delete document.documentElement.dataset.theme
  }
}

function startThemeTransition(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  document.documentElement.dataset.themeTransition = ''
  setTimeout(() => {
    delete document.documentElement.dataset.themeTransition
  }, 200)
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set) => ({
          ...initialState,
          setTheme: (theme) => {
            startThemeTransition()
            applyThemeToDOM(theme)
            set({ theme })
          },
          toggleTheme: () =>
            set((s) => {
              const next: ThemeMode = s.theme === 'dark' ? 'light' : 'dark'
              startThemeTransition()
              applyThemeToDOM(next)
              return { theme: next }
            }),
          _reset: () => {
            applyThemeToDOM('dark')
            set(initialState)
          },
        }),
        {
          name: 'trove-theme',
          onRehydrateStorage: () => (state) => {
            if (state) applyThemeToDOM(state.theme)
          },
        },
      ),
    ),
    { name: 'ThemeStore' },
  ),
)
