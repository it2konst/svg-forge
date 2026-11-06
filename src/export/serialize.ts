/**
 * Writes SVG elements back out as indented markup.
 *
 * Built on the DOM instead of string tricks, so the output is predictable:
 * one element per line, no stray xmlns on child elements (XMLSerializer adds those
 * when serializing children on their own), and text content kept intact.
 */

export interface SerializeOptions {
  indent: string
  /** Rewrites an attribute value; return null to drop the attribute. */
  mapAttribute?: (element: Element, name: string, value: string) => string | null
  /** Escapes text content for the target format. */
  escapeText?: (text: string) => string
  /** Wraps an element whose tag the target can't hold as-is (e.g. <style> in a Vue template). */
  renameTag?: (element: Element) => { open: string; close: string } | null
  /** Children to leave out (e.g. a <title> that becomes a prop). */
  skip?: (node: Node) => boolean
}

/** Elements where whitespace and inline children matter: written on one line, untouched. */
const INLINE_ELEMENTS = new Set(['text', 'tspan', 'textPath', 'title', 'desc', 'style', 'script'])

export function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function escapeXmlText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function hasText(element: Element): boolean {
  return Array.from(element.childNodes).some(
    (node) =>
      (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) &&
      (node.textContent ?? '').trim() !== '',
  )
}

function attributes(element: Element, options: SerializeOptions): string {
  let result = ''
  for (const attribute of Array.from(element.attributes)) {
    const value = options.mapAttribute
      ? options.mapAttribute(element, attribute.name, attribute.value)
      : attribute.value
    if (value !== null) result += ` ${attribute.name}="${escapeAttribute(value)}"`
  }
  return result
}

/** One element and everything inside it, on a single line. */
function inline(element: Element, options: SerializeOptions): string {
  const escapeText = options.escapeText ?? escapeXmlText
  const renamed = options.renameTag?.(element)
  const open = renamed?.open ?? `<${element.tagName}${attributes(element, options)}`
  const close = renamed?.close ?? `</${element.tagName}>`

  let inner = ''
  for (const node of Array.from(element.childNodes)) {
    if (options.skip?.(node)) continue
    if (node.nodeType === Node.ELEMENT_NODE) inner += inline(node as Element, options)
    else if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
      inner += escapeText(node.textContent ?? '')
    }
  }
  if (!inner && !renamed) return `${open} />`
  return `${renamed ? open : `${open}>`}${inner}${close}`
}

/** The children of `parent`, one element per line, indented to `depth`. */
export function serializeChildren(
  parent: Element,
  depth: number,
  options: SerializeOptions,
): string[] {
  const pad = options.indent.repeat(depth)
  const lines: string[] = []

  for (const node of Array.from(parent.childNodes)) {
    if (options.skip?.(node)) continue

    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim()
      if (text) lines.push(pad + (options.escapeText ?? escapeXmlText)(text))
      continue
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue // comments, processing instructions

    const element = node as Element
    const hasElementChildren = element.children.length > 0
    if (INLINE_ELEMENTS.has(element.localName) || hasText(element) || !hasElementChildren) {
      lines.push(pad + inline(element, options))
      continue
    }

    lines.push(`${pad}<${element.tagName}${attributes(element, options)}>`)
    lines.push(...serializeChildren(element, depth + 1, options))
    lines.push(`${pad}</${element.tagName}>`)
  }
  return lines
}
