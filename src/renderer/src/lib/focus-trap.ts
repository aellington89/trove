const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Returns all focusable descendants of `root` in document order.
 * Excludes disabled elements and elements with tabindex="-1".
 */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

/**
 * Cycles Tab and Shift+Tab focus within `root`. Call from a keydown handler
 * attached to the trap container. Does nothing if there are no focusable
 * descendants or the active element is outside `root`.
 */
export function trapFocus(e: KeyboardEvent, root: HTMLElement): void {
  if (e.key !== 'Tab') return
  const focusable = getFocusableElements(root)
  if (focusable.length === 0) {
    e.preventDefault()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (e.shiftKey) {
    if (active === first || !root.contains(active)) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (active === last || !root.contains(active)) {
      e.preventDefault()
      first.focus()
    }
  }
}
