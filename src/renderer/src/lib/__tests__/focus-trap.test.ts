// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { getFocusableElements, trapFocus } from '../focus-trap'

function setRoot(html: string): HTMLElement {
  document.body.innerHTML = `<div id="root">${html}</div>`
  return document.getElementById('root') as HTMLElement
}

describe('getFocusableElements', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns buttons, links, inputs, selects, and textareas in order', () => {
    const root = setRoot(`
      <a href="#a">link</a>
      <button>btn</button>
      <input type="text" />
      <select><option>x</option></select>
      <textarea></textarea>
    `)
    const els = getFocusableElements(root)
    expect(els.map((e) => e.tagName)).toEqual(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'])
  })

  it('returns elements with tabindex >= 0', () => {
    const root = setRoot(`
      <div tabindex="0" id="a"></div>
      <div tabindex="2" id="b"></div>
    `)
    const els = getFocusableElements(root)
    expect(els.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('skips elements with tabindex="-1"', () => {
    const root = setRoot(`
      <button id="a">a</button>
      <div tabindex="-1" id="skip"></div>
      <button id="b">b</button>
    `)
    const els = getFocusableElements(root)
    expect(els.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('skips disabled buttons, inputs, selects, and textareas', () => {
    const root = setRoot(`
      <button disabled>x</button>
      <input disabled />
      <select disabled><option>x</option></select>
      <textarea disabled></textarea>
      <button id="ok">ok</button>
    `)
    const els = getFocusableElements(root)
    expect(els).toHaveLength(1)
    expect(els[0].id).toBe('ok')
  })

  it('returns empty array when no focusable descendants', () => {
    const root = setRoot('<p>just text</p>')
    expect(getFocusableElements(root)).toEqual([])
  })
})

describe('trapFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function makeKey(key: string, shiftKey = false): KeyboardEvent {
    return new KeyboardEvent('keydown', { key, shiftKey, cancelable: true, bubbles: true })
  }

  it('does nothing for non-Tab keys', () => {
    const root = setRoot('<button id="a">a</button>')
    const e = makeKey('Enter')
    trapFocus(e, root)
    expect(e.defaultPrevented).toBe(false)
  })

  it('wraps from last to first on Tab', () => {
    const root = setRoot('<button id="a">a</button><button id="b">b</button>')
    const last = document.getElementById('b') as HTMLButtonElement
    last.focus()
    expect(document.activeElement?.id).toBe('b')

    const e = makeKey('Tab')
    trapFocus(e, root)

    expect(e.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('a')
  })

  it('wraps from first to last on Shift+Tab', () => {
    const root = setRoot('<button id="a">a</button><button id="b">b</button>')
    const first = document.getElementById('a') as HTMLButtonElement
    first.focus()

    const e = makeKey('Tab', true)
    trapFocus(e, root)

    expect(e.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('b')
  })

  it('does not wrap when in the middle of the focus chain', () => {
    const root = setRoot(
      '<button id="a">a</button><button id="b">b</button><button id="c">c</button>'
    )
    const middle = document.getElementById('b') as HTMLButtonElement
    middle.focus()

    const e = makeKey('Tab')
    trapFocus(e, root)

    // Browser handles natural Tab progression; helper only intervenes at boundaries
    expect(e.defaultPrevented).toBe(false)
  })

  it('focuses first element when active element is outside root on Tab', () => {
    const root = setRoot('<button id="inside">inside</button>')
    const outside = document.createElement('button')
    outside.id = 'outside'
    document.body.appendChild(outside)
    outside.focus()

    const e = makeKey('Tab')
    trapFocus(e, root)

    expect(e.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('inside')
  })

  it('prevents default when no focusable descendants', () => {
    const root = setRoot('<p>nothing</p>')
    const e = makeKey('Tab')
    trapFocus(e, root)
    expect(e.defaultPrevented).toBe(true)
  })
})
