import { parseSvgRoot, readSvgBox } from './geometry'
import { escapeAttribute, serializeChildren } from './serialize'

export interface VueExportOptions {
  /** PascalCase component name, used in the doc comment. */
  name: string
  /** Default for the size prop: a number (px) or any CSS length. */
  defaultSize: string
  /** Replace every color with currentColor, so the icon takes the text color. */
  currentColor: boolean
  sourceName: string
}

export interface VueExportResult {
  code: string
  /** Distinct colors in the SVG, to warn before flattening them with currentColor. */
  colorCount: number
}

/** Attributes that hold a paint color. */
const COLOR_ATTRIBUTES = new Set([
  'fill',
  'stroke',
  'stop-color',
  'flood-color',
  'lighting-color',
  'color',
])
/** A color declaration in a style attribute or a <style> sheet (not background-color etc.). */
const COLOR_STYLE =
  /(?<![\w-])(fill|stroke|stop-color|flood-color|lighting-color|color)\s*:\s*([^;}]+)/g

/** Values that are not a concrete color and must stay as they are. */
function isKeepableColor(value: string): boolean {
  const v = value.trim().toLowerCase()
  return (
    v === '' ||
    v === 'none' ||
    v === 'currentcolor' ||
    v === 'inherit' ||
    v === 'transparent' ||
    v.startsWith('url(')
  )
}

function collectColors(root: Element): Set<string> {
  const colors = new Set<string>()
  const addStyleColors = (css: string) => {
    for (const [, , value = ''] of css.matchAll(COLOR_STYLE)) {
      if (!isKeepableColor(value)) colors.add(value.trim().toLowerCase())
    }
  }
  const visit = (element: Element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (COLOR_ATTRIBUTES.has(attribute.name) && !isKeepableColor(attribute.value)) {
        colors.add(attribute.value.trim().toLowerCase())
      }
      if (attribute.name === 'style') addStyleColors(attribute.value)
    }
    if (element.localName === 'style') addStyleColors(element.textContent ?? '')
    Array.from(element.children).forEach(visit)
  }
  visit(root)
  return colors
}

function cssToCurrentColor(css: string): string {
  return css.replace(COLOR_STYLE, (match, property: string, color: string) =>
    isKeepableColor(color) ? match : `${property}:currentColor`,
  )
}

function toCurrentColor(name: string, value: string): string {
  if (COLOR_ATTRIBUTES.has(name)) return isKeepableColor(value) ? value : 'currentColor'
  return name === 'style' ? cssToCurrentColor(value) : value
}

/** A JS string literal in single quotes. */
function quote(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ')}'`
}

function sizeLiteral(size: string): string {
  const trimmed = size.trim()
  return /^\d+(\.\d+)?$/.test(trimmed) ? trimmed : quote(trimmed || '1em')
}

/**
 * Text for a Vue template: & and < must be escaped, > may stay (keeps CSS selectors
 * like `svg > g` readable), and mustaches are written as entities so Vue doesn't
 * read them as interpolation.
 */
function escapeVueText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\{\{/g, '&#123;&#123;')
    .replace(/\}\}/g, '&#125;&#125;')
}

/** Root attributes the component sets itself, or that a template doesn't need. */
function keepRootAttribute(name: string): boolean {
  return !['width', 'height', 'xmlns', 'version'].includes(name) && !name.startsWith('xmlns:')
}

export function toVueComponent(markup: string, options: VueExportOptions): VueExportResult {
  const root = parseSvgRoot(markup)
  if (!root) return { code: '', colorCount: 0 }

  const colorCount = collectColors(root).size

  // <style> sheets are text, not attributes: recolor them on the parsed copy.
  if (options.currentColor) {
    for (const sheet of Array.from(root.getElementsByTagName('style'))) {
      sheet.textContent = cssToCurrentColor(sheet.textContent ?? '')
    }
  }

  // A top-level <title> becomes the default of the title prop instead of a fixed element.
  const titleElement = Array.from(root.children).find((el) => el.localName === 'title')
  const defaultTitle = titleElement?.textContent?.trim() || undefined

  const mapAttribute = (_element: Element, name: string, value: string) =>
    options.currentColor ? toCurrentColor(name, value) : value

  // Root attributes, one per line, followed by the bindings the component adds.
  const rootAttributes: string[] = []
  if (!root.hasAttribute('viewBox')) {
    const box = readSvgBox(root)
    if (box) rootAttributes.push(`viewBox="0 0 ${box.width} ${box.height}"`)
  }
  for (const attribute of Array.from(root.attributes)) {
    if (!keepRootAttribute(attribute.name)) continue
    const value = mapAttribute(root, attribute.name, attribute.value)
    rootAttributes.push(`${attribute.name}="${escapeAttribute(value)}"`)
  }
  rootAttributes.push(
    ':width="size"',
    `:role="title ? 'img' : undefined"`,
    `:aria-hidden="title ? undefined : 'true'"`,
  )

  const body = serializeChildren(root, 2, {
    indent: '  ',
    mapAttribute,
    escapeText: escapeVueText,
    skip: (node) => node === titleElement,
    // Vue templates drop <style> tags; a dynamic component renders it anyway.
    renameTag: (element) =>
      element.localName === 'style'
        ? { open: `<component :is="'style'">`, close: '</component>' }
        : null,
  })

  const defaults = [`size: ${sizeLiteral(options.defaultSize)}`]
  if (defaultTitle) defaults.push(`title: ${quote(defaultTitle)}`)

  const code = [
    '<script setup lang="ts">',
    '/**',
    ` * ${options.name}: ${options.sourceName}, optimized with svg-forge.`,
    ' * `size` sets the width; the height follows the viewBox aspect ratio.',
    ' * Without `title` the SVG is decorative and hidden from screen readers.',
    ' */',
    'withDefaults(',
    '  defineProps<{',
    "    /** Width: a number in px or any CSS length, e.g. '1em' or '100%'. */",
    '    size?: number | string',
    '    /** Accessible name. Leave it empty when the SVG is only decoration. */',
    '    title?: string',
    '  }>(),',
    `  { ${defaults.join(', ')} },`,
    ')',
    '</script>',
    '',
    '<template>',
    '  <svg',
    ...rootAttributes.map((attribute) => `    ${attribute}`),
    '  >',
    '    <title v-if="title">{{ title }}</title>',
    ...body,
    '  </svg>',
    '</template>',
    '',
  ].join('\n')

  return { code, colorCount }
}
