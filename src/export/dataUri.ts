/**
 * SVG as a data: URI, for CSS backgrounds, <img src> or HTML attributes.
 *
 * URL-encoding is usually smaller than base64 and compresses better with gzip,
 * because the markup stays readable text. Only characters that break a URI
 * (or a CSS url("…")) are escaped.
 */

import { normalizeSvgMarkup } from '@/utils/svg'

export type DataUriEncoding = 'url' | 'base64'

export function toUrlEncodedDataUri(markup: string): string {
  const text = markup.trim().replace(/\s+/g, ' ')

  // Escape first: a later "%22" must not have its % escaped again.
  const escaped = text.replace(/[%#<>?[\\\]^`{|}]|[^\x20-\x7E]/gu, (char) =>
    encodeURIComponent(char),
  )

  // Double quotes would end url("…") in CSS. Swapping them for single quotes is
  // shortest, but only safe when the markup has no single quotes of its own.
  const quoted = text.includes("'") ? escaped.replace(/"/g, '%22') : escaped.replace(/"/g, "'")
  return `data:image/svg+xml,${quoted}`
}

export function toBase64DataUri(markup: string): string {
  const bytes = new TextEncoder().encode(markup.trim())
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:image/svg+xml;base64,${btoa(binary)}`
}

/**
 * A data URI is a standalone image, so it needs xmlns even when the
 * "Remove xmlns" plugin stripped it for inline use.
 */
export function toDataUri(markup: string, encoding: DataUriEncoding): string {
  const standalone = normalizeSvgMarkup(markup)
  return encoding === 'base64' ? toBase64DataUri(standalone) : toUrlEncodedDataUri(standalone)
}
