import { describe, expect, it } from 'vitest'
import {
  byteLength,
  looksLikeSvgFile,
  looksLikeSvgText,
  MAX_SVG_BYTES,
  normalizeSvgMarkup,
  prepareSvgMarkup,
  readSvgFile,
  SvgInputError,
  validateSvgMarkup,
} from './svg'

const SVG_NS = 'xmlns="http://www.w3.org/2000/svg"'
const XLINK_NS = 'xmlns:xlink="http://www.w3.org/1999/xlink"'

/** Runs fn and returns the SvgInputError code it throws. */
function errorCode(fn: () => unknown): string | undefined {
  try {
    fn()
  } catch (error) {
    if (error instanceof SvgInputError) return error.code
    throw error
  }
  return undefined
}

describe('normalizeSvgMarkup', () => {
  it('adds the SVG namespace to inline SVG copied from HTML', () => {
    expect(normalizeSvgMarkup('<svg viewBox="0 0 1 1"></svg>')).toBe(
      `<svg ${SVG_NS} viewBox="0 0 1 1"></svg>`,
    )
  })

  it('adds xmlns:xlink only when xlink is used', () => {
    const result = normalizeSvgMarkup(`<svg ${SVG_NS}><use xlink:href="#a"/></svg>`)
    expect(result).toContain(XLINK_NS)
    expect(normalizeSvgMarkup(`<svg ${SVG_NS}><use href="#a"/></svg>`)).not.toContain('xlink')
  })

  it('leaves complete markup untouched', () => {
    const markup = `<svg ${SVG_NS} ${XLINK_NS}><use xlink:href="#a"/></svg>`
    expect(normalizeSvgMarkup(markup)).toBe(markup)
  })

  it('only touches the root tag, not nested <svg> elements', () => {
    const result = normalizeSvgMarkup('<svg><svg x="1"/></svg>')
    expect(result).toBe(`<svg ${SVG_NS}><svg x="1"/></svg>`)
  })

  it('keeps the XML prolog in place', () => {
    const result = normalizeSvgMarkup('<?xml version="1.0"?>\n<svg></svg>')
    expect(result).toBe(`<?xml version="1.0"?>\n<svg ${SVG_NS}></svg>`)
  })

  it('strips a byte order mark and surrounding whitespace', () => {
    expect(normalizeSvgMarkup(`﻿  <svg ${SVG_NS}/>  `)).toBe(`<svg ${SVG_NS}/>`)
  })

  it('returns text without an <svg> tag as it is', () => {
    expect(normalizeSvgMarkup('hello')).toBe('hello')
  })
})

describe('validateSvgMarkup', () => {
  it('accepts a well-formed SVG document', () => {
    expect(errorCode(() => validateSvgMarkup(`<svg ${SVG_NS}><path d="M0 0"/></svg>`))).toBe(
      undefined,
    )
  })

  it('rejects empty input', () => {
    expect(errorCode(() => validateSvgMarkup('   \n'))).toBe('empty')
  })

  it('reports text without an <svg> tag as "not SVG", not as broken markup', () => {
    expect(errorCode(() => validateSvgMarkup('just some notes'))).toBe('notSvg')
  })

  it('reports malformed XML', () => {
    expect(errorCode(() => validateSvgMarkup(`<svg ${SVG_NS}><g></svg>`))).toBe('invalidXml')
  })

  it('rejects documents whose root is not <svg>', () => {
    expect(errorCode(() => validateSvgMarkup(`<html><svg ${SVG_NS}/></html>`))).toBe('notSvg')
  })

  it('rejects an <svg> root in a foreign namespace', () => {
    expect(errorCode(() => validateSvgMarkup('<svg xmlns="http://example.com/x"/>'))).toBe('notSvg')
  })

  it('rejects input over the size limit', () => {
    const huge = `<svg ${SVG_NS}><!--${'x'.repeat(MAX_SVG_BYTES)}--></svg>`
    expect(errorCode(() => validateSvgMarkup(huge))).toBe('tooLarge')
  })
})

describe('prepareSvgMarkup', () => {
  it('turns inline SVG with xlink from an HTML page into a valid document', () => {
    const inline = '<svg viewBox="0 0 2 2"><use xlink:href="#c"/></svg>'
    const prepared = prepareSvgMarkup(inline)
    expect(prepared).toContain(SVG_NS)
    expect(prepared).toContain(XLINK_NS)
  })

  it('does not execute scripts while parsing', () => {
    const globals = globalThis as { __svgTestRan?: boolean }
    prepareSvgMarkup(
      `<svg ${SVG_NS} onload="globalThis.__svgTestRan = true"><script>globalThis.__svgTestRan = true</script></svg>`,
    )
    expect(globals.__svgTestRan).toBeUndefined()
  })
})

describe('quick checks', () => {
  it('recognizes SVG files by extension or MIME type', () => {
    expect(looksLikeSvgFile(new File([''], 'Icon.SVG'))).toBe(true)
    expect(looksLikeSvgFile(new File([''], 'blob', { type: 'image/svg+xml' }))).toBe(true)
    expect(looksLikeSvgFile(new File([''], 'photo.png', { type: 'image/png' }))).toBe(false)
  })

  it('recognizes SVG text by its tag', () => {
    expect(looksLikeSvgText('<svg>')).toBe(true)
    expect(looksLikeSvgText('<SVG viewBox="0 0 1 1">')).toBe(true)
    expect(looksLikeSvgText('<svgfoo>')).toBe(false)
    expect(looksLikeSvgText('svg')).toBe(false)
  })

  it('counts bytes, not characters', () => {
    expect(byteLength('abc')).toBe(3)
    expect(byteLength('ё')).toBe(2)
    expect(byteLength('😀')).toBe(4)
  })
})

describe('readSvgFile', () => {
  it('reads and normalizes an SVG file', async () => {
    const file = new File(['<svg viewBox="0 0 1 1"/>'], 'icon.svg', { type: 'image/svg+xml' })
    await expect(readSvgFile(file)).resolves.toBe(`<svg ${SVG_NS} viewBox="0 0 1 1"/>`)
  })

  it('rejects files that are not SVG before reading them', async () => {
    const file = new File(['<svg/>'], 'icon.png', { type: 'image/png' })
    await expect(readSvgFile(file)).rejects.toMatchObject({ code: 'notSvg' })
  })

  it('rejects SVG files with broken markup', async () => {
    const file = new File([`<svg ${SVG_NS}><g>`], 'broken.svg')
    await expect(readSvgFile(file)).rejects.toMatchObject({ code: 'invalidXml' })
  })
})
