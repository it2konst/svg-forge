import { describe, expect, it } from 'vitest'
import { buildSprite, prefixIds, spriteUsage, symbolIds } from './sprite'
import { parseSvgRoot } from './geometry'

const NS = 'xmlns="http://www.w3.org/2000/svg"'

/** Parses the generated sprite and returns its symbols, failing on invalid XML. */
function parseSprite(code: string) {
  const doc = new DOMParser().parseFromString(code, 'image/svg+xml')
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
  return Array.from(doc.documentElement.getElementsByTagName('symbol'))
}

describe('symbolIds', () => {
  it('turns file names into unique, valid ids', () => {
    expect(
      symbolIds(['Arrow Left.svg', 'arrow-left.svg', 'close.svg', '24.svg', 'ёлка.svg']),
    ).toEqual(['arrow-left', 'arrow-left-2', 'close', 'svg-24', 'svg-icon'])
  })
})

describe('prefixIds', () => {
  it('renames ids and every kind of reference to them', () => {
    const root = parseSvgRoot(
      `<svg ${NS} xmlns:xlink="http://www.w3.org/1999/xlink" aria-labelledby="t d">` +
        '<title id="t">Icon</title><desc id="d">Text</desc>' +
        '<style>#dot{fill:url(#g)} #dot-2{opacity:.5}</style>' +
        '<defs><linearGradient id="g"/><clipPath id="c"/></defs>' +
        '<circle id="dot" fill="url(#g)" clip-path="url( \'#c\' )" style="stroke:url(&quot;#g&quot;)"/>' +
        '<use href="#dot"/><use xlink:href="#dot"/><use href="#missing"/></svg>',
    )!
    prefixIds(root, 'icon')
    const markup = new XMLSerializer().serializeToString(root)

    expect(markup).toContain('id="icon-g"')
    expect(markup).toContain('fill="url(#icon-g)"')
    expect(markup).toContain(`clip-path="url('#icon-c')"`)
    expect(markup).toContain('style="stroke:url(&quot;#icon-g&quot;)"')
    expect(markup).toContain('<use href="#icon-dot"/>')
    expect(markup).toContain('xlink:href="#icon-dot"')
    expect(markup).toContain('href="#missing"') // unknown targets stay as they are
    expect(markup).toContain('aria-labelledby="icon-t icon-d"')
    expect(markup).toContain('#icon-dot{fill:url(#icon-g)}')
    // #dot-2 is a different id that only starts like "dot"
    expect(markup).toContain('#dot-2{opacity:.5}')
  })

  it('keeps the xlink namespace on rewritten xlink:href', () => {
    const root = parseSvgRoot(
      `<svg ${NS} xmlns:xlink="http://www.w3.org/1999/xlink"><path id="p"/><use xlink:href="#p"/></svg>`,
    )!
    prefixIds(root, 'x')
    const use = root.getElementsByTagName('use')[0]!
    expect(use.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#x-p')
    expect(use.attributes).toHaveLength(1)
  })
})

describe('buildSprite', () => {
  const gradientIcon = (color: string) =>
    `<svg ${NS} viewBox="0 0 24 24"><defs><linearGradient id="g"><stop stop-color="${color}"/></linearGradient></defs><rect width="24" height="24" fill="url(#g)"/></svg>`

  it('puts every file into its own symbol with a viewBox', () => {
    const { code, symbols } = buildSprite(
      [
        { name: 'sun.svg', markup: gradientIcon('#fc0') },
        { name: 'moon.svg', markup: `<svg ${NS} width="32" height="16"><path d="M0 0"/></svg>` },
      ],
      'file',
    )
    const parsed = parseSprite(code)
    expect(parsed.map((s) => [s.id, s.getAttribute('viewBox')])).toEqual([
      ['sun', '0 0 24 24'],
      ['moon', '0 0 32 16'],
    ])
    expect(symbols.map((s) => s.box)).toEqual([
      { width: 24, height: 24 },
      { width: 32, height: 16 },
    ])
  })

  it('keeps icons with the same inner ids apart', () => {
    const { code } = buildSprite(
      [
        { name: 'a.svg', markup: gradientIcon('#f00') },
        { name: 'b.svg', markup: gradientIcon('#00f') },
      ],
      'file',
    )
    const ids = Array.from(code.matchAll(/ id="([^"]+)"/g), (m) => m[1])
    expect(new Set(ids).size).toBe(ids.length)
    expect(code).toContain('fill="url(#a-g)"')
    expect(code).toContain('fill="url(#b-g)"')
  })

  it('drops width, height and namespaces from the symbols but keeps presentation attributes', () => {
    const { code } = buildSprite(
      [
        {
          name: 'i.svg',
          markup: `<svg ${NS} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M0 0"/></svg>`,
        },
      ],
      'file',
    )
    expect(code).toContain('<symbol id="i" viewBox="0 0 24 24" fill="none" stroke="currentColor">')
  })

  it('declares xlink only when a symbol uses it', () => {
    const plain = buildSprite([{ name: 'a.svg', markup: gradientIcon('#000') }], 'file').code
    expect(plain).not.toContain('xmlns:xlink')
    const withXlink = buildSprite(
      [
        {
          name: 'b.svg',
          markup: `<svg ${NS} xmlns:xlink="http://www.w3.org/1999/xlink"><path id="p"/><use xlink:href="#p"/></svg>`,
        },
      ],
      'file',
    ).code
    expect(withXlink).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"')
    parseSprite(withXlink)
  })

  it('hides an inline sprite without display:none', () => {
    const { code } = buildSprite([{ name: 'a.svg', markup: gradientIcon('#000') }], 'inline')
    expect(code).toMatch(
      /^<svg [^>]*aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">/,
    )
    expect(code).not.toContain('display:none')
  })

  it('works with SVG that had xmlns removed for inline use', () => {
    const { symbols, code } = buildSprite(
      [{ name: 'a.svg', markup: '<svg viewBox="0 0 2 2"><path d="M0 0"/></svg>' }],
      'file',
    )
    expect(symbols).toHaveLength(1)
    expect(parseSprite(code)).toHaveLength(1)
  })

  it('leaves out files that do not parse and names them', () => {
    const result = buildSprite(
      [
        { name: 'ok.svg', markup: gradientIcon('#000') },
        { name: 'broken.svg', markup: '<svg><g></svg>' },
      ],
      'file',
    )
    expect(result.symbols.map((s) => s.id)).toEqual(['ok'])
    expect(result.skipped).toEqual(['broken.svg'])
  })
})

describe('spriteUsage', () => {
  const symbols = [
    { id: 'sun', name: 'sun.svg', box: { width: 24, height: 24 } },
    { id: 'wide', name: 'wide.svg', box: { width: 48, height: 24 } },
    { id: 'c', name: 'c.svg', box: null },
    { id: 'd', name: 'd.svg', box: null },
  ]

  it('points <use> at the sprite file', () => {
    expect(spriteUsage(symbols, 'file').split('\n')[0]).toBe(
      '<svg width="24" height="24" aria-hidden="true"><use href="sprite.svg#sun"/></svg>',
    )
  })

  it('points <use> at the id for an inline sprite and keeps the aspect ratio', () => {
    expect(spriteUsage(symbols, 'inline').split('\n')[1]).toBe(
      '<svg width="24" height="12" aria-hidden="true"><use href="#wide"/></svg>',
    )
  })

  it('shows a few examples and says how many more there are', () => {
    expect(spriteUsage(symbols, 'file').split('\n')).toHaveLength(4)
    expect(spriteUsage(symbols, 'file')).toContain('…and 1 more')
  })
})
