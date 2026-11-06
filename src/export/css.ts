import { toDataUri } from './dataUri'
import { aspectRatio, parseSvgRoot, readSvgBox } from './geometry'

/**
 * background: the SVG as it is, with its own colors.
 * mask: only the shape counts; it is filled with the text color (currentColor),
 *       so one icon can be recolored with CSS, like an icon font.
 */
export type CssMode = 'background' | 'mask'

export interface CssExportOptions {
  className: string
  mode: CssMode
  sourceName: string
}

export function toCss(markup: string, { className, mode, sourceName }: CssExportOptions): string {
  const uri = toDataUri(markup, 'url')
  const root = parseSvgRoot(markup)
  const box = root ? readSvgBox(root) : null

  const lines = [
    `/* ${sourceName}, optimized with svg-forge.`,
    ` * Usage: <span class="${className}"></span>. Set a width; the height follows`,
    ` * the aspect ratio.${mode === 'mask' ? ' The icon takes the text color.' : ''} */`,
    `.${className} {`,
    '  display: inline-block;',
  ]
  if (box) lines.push(`  aspect-ratio: ${aspectRatio(box)};`)

  if (mode === 'background') {
    lines.push(`  background: url("${uri}") no-repeat center / contain;`)
  } else {
    // The image is stored once in a custom property and reused by both mask lines,
    // so the prefixed fallback for older Safari doesn't double the size.
    lines.push(
      `  --${className}-image: url("${uri}");`,
      '  background-color: currentColor;',
      `  -webkit-mask: var(--${className}-image) no-repeat center / contain;`,
      `  mask: var(--${className}-image) no-repeat center / contain;`,
    )
  }

  lines.push('}', '')
  return lines.join('\n')
}
