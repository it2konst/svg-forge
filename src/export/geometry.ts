import { normalizeSvgMarkup } from '@/utils/svg'

export interface SvgBox {
  width: number
  height: number
}

/** Plain numbers and px only; %, em and friends can't be resolved without a layout. */
function parseLength(value: string | null): number | null {
  if (!value) return null
  const match = /^\s*([\d.]+)\s*(px)?\s*$/.exec(value)
  const number = match ? Number(match[1]) : NaN
  return Number.isFinite(number) && number > 0 ? number : null
}

/** Parses SVG markup into its root element. Normalized, so markup without xmlns works too. */
export function parseSvgRoot(markup: string): Element | null {
  const doc = new DOMParser().parseFromString(normalizeSvgMarkup(markup), 'image/svg+xml')
  if (doc.getElementsByTagName('parsererror').length) return null
  return doc.documentElement.localName === 'svg' ? doc.documentElement : null
}

/** The drawing's box: from viewBox when present, otherwise from width and height. */
export function readSvgBox(root: Element): SvgBox | null {
  const viewBox = root
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number)
  if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) {
    const [, , width = 0, height = 0] = viewBox
    if (width > 0 && height > 0) return { width, height }
  }
  const width = parseLength(root.getAttribute('width'))
  const height = parseLength(root.getAttribute('height'))
  return width && height ? { width, height } : null
}

/** "800 / 500" for CSS aspect-ratio, with long decimals trimmed. */
export function aspectRatio(box: SvgBox): string {
  const round = (n: number) => Number(n.toFixed(3))
  return `${round(box.width)} / ${round(box.height)}`
}
