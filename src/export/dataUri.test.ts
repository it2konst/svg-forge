import { describe, expect, it } from 'vitest'
import { toBase64DataUri, toDataUri, toUrlEncodedDataUri } from './dataUri'

const PREFIX = 'data:image/svg+xml,'
const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><path fill="#f00" d="M0 0h4v4z"/></svg>'

function decodeUrl(uri: string): string {
  return decodeURIComponent(uri.slice(PREFIX.length))
}

function decodeBase64(uri: string): string {
  const bytes = Uint8Array.from(atob(uri.split(',')[1] ?? ''), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

describe('toUrlEncodedDataUri', () => {
  it('swaps double quotes for single ones when that is safe', () => {
    const uri = toUrlEncodedDataUri(SVG)
    expect(uri.startsWith(PREFIX)).toBe(true)
    expect(uri).not.toContain('"')
    expect(decodeUrl(uri)).toBe(SVG.replace(/"/g, "'"))
  })

  it('escapes double quotes when the SVG has single quotes of its own', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><text font-family="'Onest'">x</text></svg>`
    const uri = toUrlEncodedDataUri(svg)
    expect(uri).not.toContain('"')
    expect(uri).toContain('%22')
    expect(decodeUrl(uri)).toBe(svg)
  })

  it('escapes % only once', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%"><text font-family="'A'">50%</text></svg>`
    expect(decodeUrl(toUrlEncodedDataUri(svg))).toBe(svg)
  })

  it('escapes # so colors do not end the URI', () => {
    expect(toUrlEncodedDataUri(SVG)).toContain('%23f00')
  })

  it('encodes non-ASCII text', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>ёлка 😀</text></svg>'
    const uri = toUrlEncodedDataUri(svg)
    expect(uri).toMatch(/^[\x20-\x7E]+$/)
    expect(decodeUrl(uri)).toBe(svg.replace(/"/g, "'"))
  })

  it('collapses whitespace and line breaks', () => {
    const uri = toUrlEncodedDataUri(
      '<svg xmlns="http://www.w3.org/2000/svg">\n  <g>\n  </g>\n</svg>',
    )
    expect(uri).not.toMatch(/\s{2}|\n/)
  })
})

describe('toBase64DataUri', () => {
  it('round-trips UTF-8 text', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>ёлка 😀</text></svg>'
    const uri = toBase64DataUri(svg)
    expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true)
    expect(decodeBase64(uri)).toBe(svg)
  })
})

describe('toDataUri', () => {
  it('adds xmlns back, so SVG made for inline use still works as an image', () => {
    const inline = '<svg viewBox="0 0 1 1"/>'
    expect(decodeUrl(toDataUri(inline, 'url'))).toContain("xmlns='http://www.w3.org/2000/svg'")
    expect(decodeBase64(toDataUri(inline, 'base64'))).toContain(
      'xmlns="http://www.w3.org/2000/svg"',
    )
  })

  it('is usually shorter URL-encoded than in base64', () => {
    expect(toDataUri(SVG, 'url').length).toBeLessThan(toDataUri(SVG, 'base64').length)
  })
})
