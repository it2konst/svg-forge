import { parseSvgRoot, readSvgBox } from './geometry'

/**
 * A sensible default width for a component: the drawing's own width,
 * rounded, or 24 (the usual icon size) when it can't be read.
 */
export function geometrySize(markup: string): string {
  const root = parseSvgRoot(markup)
  const box = root ? readSvgBox(root) : null
  return box ? String(Math.round(box.width)) : '24'
}
