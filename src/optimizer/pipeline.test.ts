// @vitest-environment node
/**
 * End-to-end check of what the worker does: our config fed into the same
 * svgo/browser build the app ships, on real input.
 */
import { optimize } from 'svgo/browser'
import { describe, expect, it } from 'vitest'
import demo from '@/assets/demo.svg?raw'
import { buildSvgoConfig, defaultSettings } from './config'
import { BUILTIN_PRESETS } from './presets'

const run = (markup: string, settings = defaultSettings()) =>
  optimize(markup, buildSvgoConfig(settings)).data

describe('optimizing with the default settings', () => {
  const output = run(demo)

  it('makes the demo much smaller', () => {
    expect(output.length).toBeLessThan(demo.length * 0.4)
  })

  it('removes editor leftovers', () => {
    expect(output).not.toMatch(/inkscape|sodipodi|<metadata|<!--|<\?xml/)
    expect(output).not.toContain('gradient-unused')
  })

  it('keeps the accessible title and description', () => {
    expect(output).toContain('<title>Evening hills</title>')
    expect(output).toContain('<desc>')
  })

  it('keeps the viewBox', () => {
    expect(output).toContain('viewBox="0 0 800 500"')
  })

  it('strips scripts and event handlers', () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><circle r="4" onclick="alert(3)"/></svg>'
    const clean = run(evil)
    expect(clean).not.toMatch(/<script|onload|onclick|alert/)
    expect(clean).toContain('<circle')
  })
})

describe('optimizing with each built-in preset', () => {
  it.each(BUILTIN_PRESETS.map((preset) => [preset.id, preset] as const))(
    '%s produces valid, smaller SVG',
    (_id, preset) => {
      const output = run(demo, preset.create())
      expect(output.length).toBeLessThan(demo.length)
      expect(output).toMatch(/^<svg[\s>]/)
      expect(output).toMatch(/<\/svg>$/)
    },
  )

  it('"Inline icons" drops width, height and xmlns', () => {
    const inline = BUILTIN_PRESETS.find((p) => p.id === 'inline')!
    const output = run(demo, inline.create())
    expect(output).not.toMatch(/<svg[^>]*\s(width|height|xmlns)=/)
  })

  it('"Maximum compression" beats the default', () => {
    const maximum = BUILTIN_PRESETS.find((p) => p.id === 'maximum')!
    expect(run(demo, maximum.create()).length).toBeLessThan(run(demo).length)
  })
})
