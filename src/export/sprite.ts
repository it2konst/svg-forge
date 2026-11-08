/**
 * SVG sprite: many icons in one file, each in its own <symbol>, drawn with <use>.
 *
 *   <svg><use href="sprite.svg#arrow-left"/></svg>
 *
 * Every icon's inner ids (gradients, clip paths, masks…) get the symbol id as a
 * prefix, so two icons that both define "gradient-1" don't steal each other's.
 */
import { parseSvgRoot, readSvgBox, type SvgBox } from './geometry'
import { baseName, toKebabCase } from './names'
import { serializeChildren } from './serialize'

export interface SpriteSource {
  name: string
  markup: string
}

/**
 * file: a standalone sprite.svg, referenced as sprite.svg#id (same origin only).
 * inline: a hidden <svg> to paste at the top of <body>, referenced as #id.
 */
export type SpriteMode = 'file' | 'inline'

export interface SpriteSymbol {
  id: string
  name: string
  box: SvgBox | null
}

export interface SpriteResult {
  code: string
  symbols: SpriteSymbol[]
  /** Files that could not be parsed and were left out. */
  skipped: string[]
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'

/** Root attributes that make no sense on a <symbol> or are set by the sprite itself. */
const DROPPED_ROOT_ATTRIBUTES = new Set([
  'width',
  'height',
  'x',
  'y',
  'id',
  'version',
  'baseProfile',
])

/** Attributes that hold a list of ids, for accessibility. */
const ID_LIST_ATTRIBUTES = new Set(['aria-labelledby', 'aria-describedby'])

/** One id per file, from its name: arrow-left, arrow-left-2, … */
export function symbolIds(names: readonly string[]): string[] {
  const used = new Set<string>()
  return names.map((name) => {
    const base = toKebabCase(baseName(name))
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    return id
  })
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Renames every id inside `root` to `${prefix}-${id}` and rewrites the references:
 * href / xlink:href="#id", url(#id) in any attribute or <style> sheet, #id selectors
 * in <style>, and aria-labelledby / aria-describedby lists. Mutates the parsed copy.
 */
export function prefixIds(root: Element, prefix: string): void {
  const renamed = new Map<string, string>()
  for (const element of Array.from(root.querySelectorAll('[id]'))) {
    const id = element.getAttribute('id') as string
    const next = `${prefix}-${id}`
    renamed.set(id, next)
    element.setAttribute('id', next)
  }
  if (!renamed.size) return

  const rewriteUrls = (text: string) =>
    text.replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (match, quote: string, id: string) => {
      const next = renamed.get(id)
      return next ? `url(${quote}#${next}${quote})` : match
    })

  const rewriteSelectors = (css: string) => {
    let result = css
    for (const [id, next] of renamed) {
      // #id as a selector, not followed by more name characters.
      result = result.replace(new RegExp(`#${escapeRegExp(id)}(?![\\w-])`, 'g'), `#${next}`)
    }
    return result
  }

  for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
    for (const attribute of Array.from(element.attributes)) {
      const { name, value } = attribute
      let next = value
      if ((name === 'href' || name === 'xlink:href') && value.startsWith('#')) {
        const target = renamed.get(value.slice(1))
        if (target) next = `#${target}`
      } else if (ID_LIST_ATTRIBUTES.has(name)) {
        next = value
          .split(/\s+/)
          .map((id) => renamed.get(id) ?? id)
          .join(' ')
      } else if (value.includes('url(')) {
        next = rewriteUrls(value)
      }
      if (next !== value) element.setAttributeNS(attribute.namespaceURI, name, next)
    }
    if (element.localName === 'style') {
      element.textContent = rewriteSelectors(rewriteUrls(element.textContent ?? ''))
    }
  }
}

function symbolAttributes(root: Element, id: string, box: SvgBox | null): string {
  const parts = [`id="${id}"`]
  const viewBox = root.getAttribute('viewBox') ?? (box ? `0 0 ${box.width} ${box.height}` : null)
  if (viewBox) parts.push(`viewBox="${viewBox}"`)
  for (const attribute of Array.from(root.attributes)) {
    const { name } = attribute
    if (name === 'viewBox' || DROPPED_ROOT_ATTRIBUTES.has(name) || name.startsWith('xmlns'))
      continue
    parts.push(`${name}="${attribute.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
  }
  return parts.join(' ')
}

export function buildSprite(sources: readonly SpriteSource[], mode: SpriteMode): SpriteResult {
  const ids = symbolIds(sources.map((source) => source.name))
  const symbols: SpriteSymbol[] = []
  const skipped: string[] = []
  const body: string[] = []

  sources.forEach((source, index) => {
    const root = parseSvgRoot(source.markup)
    if (!root || root.namespaceURI !== SVG_NS) {
      skipped.push(source.name)
      return
    }
    const id = ids[index] as string
    const box = readSvgBox(root)
    prefixIds(root, id)

    body.push(`  <symbol ${symbolAttributes(root, id, box)}>`)
    body.push(...serializeChildren(root, 2, { indent: '  ' }))
    body.push('  </symbol>')
    symbols.push({ id, name: source.name, box })
  })

  const namespaces = [`xmlns="${SVG_NS}"`]
  if (body.some((line) => line.includes('xlink:'))) namespaces.push(`xmlns:xlink="${XLINK_NS}"`)

  // display:none would also hide the gradients and masks the icons point to,
  // so the inline sprite is shrunk to nothing and taken out of the layout instead.
  const rootAttributes =
    mode === 'inline'
      ? [
          ...namespaces,
          'aria-hidden="true"',
          'style="position:absolute;width:0;height:0;overflow:hidden"',
        ]
      : namespaces

  const code = [`<svg ${rootAttributes.join(' ')}>`, ...body, '</svg>', ''].join('\n')
  return { code, symbols, skipped }
}

/** Width and height for a <use> snippet: the larger side scaled to `size`. */
function snippetSize(box: SvgBox | null, size = 24): { width: number; height: number } {
  if (!box) return { width: size, height: size }
  const scale = size / Math.max(box.width, box.height)
  return { width: Math.round(box.width * scale), height: Math.round(box.height * scale) }
}

/** HTML that draws the first few symbols, to copy into a page. */
export function spriteUsage(
  symbols: readonly SpriteSymbol[],
  mode: SpriteMode,
  fileName = 'sprite.svg',
  limit = 3,
): string {
  const href = (id: string) => (mode === 'file' ? `${fileName}#${id}` : `#${id}`)
  const lines = symbols.slice(0, limit).map((symbol) => {
    const { width, height } = snippetSize(symbol.box)
    return `<svg width="${width}" height="${height}" aria-hidden="true"><use href="${href(symbol.id)}"/></svg>`
  })
  if (symbols.length > limit) lines.push(`<!-- …and ${symbols.length - limit} more -->`)
  return lines.join('\n')
}

/**
 * One SVG image that draws every symbol of the sprite through <use>, in a grid.
 * Used as the dialog preview, so the preview exercises the sprite itself:
 * if an id or a reference were wrong, the icon would show up wrong here too.
 */
export function spritePreview(
  sprite: SpriteResult,
  { columns = 8, cell = 56, icon = 40 } = {},
): string {
  const count = sprite.symbols.length
  const cols = Math.max(1, Math.min(columns, count))
  const rows = Math.max(1, Math.ceil(count / cols))
  const inset = (cell - icon) / 2

  // The sprite's own <svg> root becomes a nested element that holds the symbols.
  const definitions = sprite.code.replace(/^<svg [^>]*>/, '<svg width="0" height="0">').trim()
  const uses = sprite.symbols.map((symbol, index) => {
    const x = (index % cols) * cell + inset
    const y = Math.floor(index / cols) * cell + inset
    return `<use href="#${symbol.id}" x="${x}" y="${y}" width="${icon}" height="${icon}"/>`
  })

  return [
    `<svg xmlns="${SVG_NS}" xmlns:xlink="${XLINK_NS}" viewBox="0 0 ${cols * cell} ${rows * cell}" width="${cols * cell}" height="${rows * cell}">`,
    definitions,
    ...uses,
    '</svg>',
  ].join('\n')
}
