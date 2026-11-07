// @vitest-environment node
// Node's own Blob and CompressionStream, the same APIs the browser provides.
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { gzipSize } from './gzip'

describe('gzipSize', () => {
  it('matches the size zlib produces with default settings', async () => {
    const text =
      '<svg xmlns="http://www.w3.org/2000/svg">' + '<path d="M0 0h10v10z"/>'.repeat(50) + '</svg>'
    await expect(gzipSize(text)).resolves.toBe(gzipSync(text).length)
  })

  it('measures UTF-8 bytes, not characters', async () => {
    const text = 'ёлка 😀'.repeat(20)
    await expect(gzipSize(text)).resolves.toBe(gzipSync(Buffer.from(text, 'utf8')).length)
  })

  it('shrinks repetitive markup a lot', async () => {
    const text = '<circle r="1"/>'.repeat(1000)
    expect(await gzipSize(text)).toBeLessThan(text.length / 20)
  })
})
