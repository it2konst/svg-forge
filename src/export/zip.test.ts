import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { uniqueNames, zipTextFiles } from './zip'

describe('uniqueNames', () => {
  it('keeps names that are already unique', () => {
    expect(uniqueNames(['a.svg', 'b.svg'])).toEqual(['a.svg', 'b.svg'])
  })

  it('numbers repeats the way file managers do', () => {
    expect(uniqueNames(['icon.svg', 'icon.svg', 'icon.svg'])).toEqual([
      'icon.svg',
      'icon (2).svg',
      'icon (3).svg',
    ])
  })

  it('treats names that differ only in case as the same file', () => {
    expect(uniqueNames(['Logo.svg', 'logo.SVG'])).toEqual(['Logo.svg', 'logo (2).SVG'])
  })

  it('does not collide with a name that already looks numbered', () => {
    expect(uniqueNames(['a (2).svg', 'a.svg', 'a.svg'])).toEqual([
      'a (2).svg',
      'a.svg',
      'a (3).svg',
    ])
  })

  it('handles names without an extension or starting with a dot', () => {
    expect(uniqueNames(['pasted', 'pasted', '.svg', '.svg'])).toEqual([
      'pasted',
      'pasted (2)',
      '.svg',
      '.svg (2)',
    ])
  })
})

describe('zipTextFiles', () => {
  it('packs files that unzip back to the same text', () => {
    const zip = zipTextFiles([
      { name: 'a.svg', text: '<svg>а</svg>' },
      { name: 'a.svg', text: '<svg>b</svg>' },
      { name: 'icons/c.svg', text: '<svg>c</svg>' },
    ])
    const files = unzipSync(zip)
    expect(Object.keys(files).sort()).toEqual(['a (2).svg', 'a.svg', 'c.svg'])
    expect(strFromU8(files['a.svg']!)).toBe('<svg>а</svg>')
    expect(strFromU8(files['a (2).svg']!)).toBe('<svg>b</svg>')
  })
})
