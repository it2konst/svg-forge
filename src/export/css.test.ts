import { describe, expect, it } from 'vitest'
import { toCss } from './css'
import { aspectRatio, parseSvgRoot, readSvgBox } from './geometry'

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16"><path d="M0 0h24v16z"/></svg>'

describe('toCss', () => {
  it('writes a background class with the aspect ratio', () => {
    const css = toCss(ICON, { className: 'arrow', mode: 'background', sourceName: 'arrow.svg' })
    expect(css).toContain('.arrow {')
    expect(css).toContain('aspect-ratio: 24 / 16;')
    expect(css).toMatch(
      /background: url\("data:image\/svg\+xml,[^"]+"\) no-repeat center \/ contain;/,
    )
    expect(css).not.toContain('mask')
  })

  it('writes a mask class filled with the text color', () => {
    const css = toCss(ICON, { className: 'arrow', mode: 'mask', sourceName: 'arrow.svg' })
    expect(css).toContain('background-color: currentColor;')
    expect(css).toContain('-webkit-mask: var(--arrow-image) no-repeat center / contain;')
    expect(css).toContain('mask: var(--arrow-image) no-repeat center / contain;')
  })

  it('stores the image once in mask mode', () => {
    const css = toCss(ICON, { className: 'arrow', mode: 'mask', sourceName: 'arrow.svg' })
    expect(css.match(/data:image/g)).toHaveLength(1)
  })

  it('leaves out aspect-ratio when the size is unknown', () => {
    const css = toCss('<svg xmlns="http://www.w3.org/2000/svg" width="50%"/>', {
      className: 'x',
      mode: 'background',
      sourceName: 'x.svg',
    })
    expect(css).not.toContain('aspect-ratio')
  })
})

describe('geometry', () => {
  it('reads the box from viewBox first', () => {
    const root = parseSvgRoot('<svg width="10" height="10" viewBox="0 0 800 500"/>')!
    expect(readSvgBox(root)).toEqual({ width: 800, height: 500 })
  })

  it('falls back to width and height in px', () => {
    const root = parseSvgRoot('<svg width="48px" height="32"/>')!
    expect(readSvgBox(root)).toEqual({ width: 48, height: 32 })
  })

  it('gives up on relative units', () => {
    const root = parseSvgRoot('<svg width="2em" height="100%"/>')!
    expect(readSvgBox(root)).toBeNull()
  })

  it('returns null for markup that does not parse', () => {
    expect(parseSvgRoot('<svg><g></svg>')).toBeNull()
  })

  it('trims long decimals in the aspect ratio', () => {
    expect(aspectRatio({ width: 10.123456, height: 3 })).toBe('10.123 / 3')
  })
})
