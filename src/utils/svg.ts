/**
 * Turning user input (a file or pasted text) into SVG markup we can trust to be SVG.
 *
 * Nothing here renders the markup. DOMParser with 'image/svg+xml' builds an inert
 * XML document: scripts don't run and external resources don't load.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'

/** Above this, parsing and optimizing in the browser gets slow enough to hurt. */
export const MAX_SVG_BYTES = 10 * 1024 * 1024

export type SvgErrorCode = 'empty' | 'tooLarge' | 'notSvg' | 'invalidXml'

export class SvgInputError extends Error {
  readonly code: SvgErrorCode

  constructor(code: SvgErrorCode, detail?: string) {
    super(detail ?? code)
    this.name = 'SvgInputError'
    this.code = code
  }
}

export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

/**
 * Fixes the two most common reasons copied SVG fails to parse as a standalone file:
 * inline SVG taken from HTML often has no xmlns, and xlink:href without xmlns:xlink
 * is an "unbound prefix" error in XML.
 */
export function normalizeSvgMarkup(input: string): string {
  let text = input.replace(/^﻿/, '').trim()

  const openTag = /<svg\b[^>]*>/i.exec(text)
  if (!openTag) return text

  let tag = openTag[0]
  if (!/\sxmlns\s*=/.test(tag)) {
    tag = tag.replace(/^<svg\b/i, `<svg xmlns="${SVG_NS}"`)
  }
  if (text.includes('xlink:') && !/\sxmlns:xlink\s*=/.test(tag)) {
    tag = tag.replace(/^<svg\b/i, `<svg xmlns:xlink="${XLINK_NS}"`)
  }

  if (tag !== openTag[0]) {
    text = text.slice(0, openTag.index) + tag + text.slice(openTag.index + openTag[0].length)
  }
  return text
}

/** Throws SvgInputError if the text is not a well-formed SVG document. */
export function validateSvgMarkup(text: string): void {
  if (!text.trim()) throw new SvgInputError('empty')
  if (byteLength(text) > MAX_SVG_BYTES) throw new SvgInputError('tooLarge')
  // Text without an <svg> tag is some other file, not broken SVG.
  if (!looksLikeSvgText(text)) throw new SvgInputError('notSvg')

  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  const parserError = doc.getElementsByTagName('parsererror')[0]
  if (parserError) {
    throw new SvgInputError('invalidXml', parserError.textContent?.trim())
  }

  const root = doc.documentElement
  if (root.localName !== 'svg' || root.namespaceURI !== SVG_NS) {
    throw new SvgInputError('notSvg')
  }
}

/** Normalizes and validates; returns markup that is safe to hand to SVGO and the preview. */
export function prepareSvgMarkup(input: string): string {
  const text = normalizeSvgMarkup(input)
  validateSvgMarkup(text)
  return text
}

/** Cheap check before reading: by extension or MIME type. */
export function looksLikeSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
}

/** Cheap check for pasted text, before running the full validation. */
export function looksLikeSvgText(text: string): boolean {
  return /<svg[\s>]/i.test(text)
}

export async function readSvgFile(file: File): Promise<string> {
  if (!looksLikeSvgFile(file)) throw new SvgInputError('notSvg')
  if (file.size > MAX_SVG_BYTES) throw new SvgInputError('tooLarge')
  return prepareSvgMarkup(await file.text())
}
