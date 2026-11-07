import { describe, expect, it } from 'vitest'
import { defaultSettings } from './config'
import { PLUGINS } from './plugins'
import { BUILTIN_PRESETS, cloneSettings, sameSettings } from './presets'

describe('built-in presets', () => {
  it('starts with SVGO default, equal to the default settings', () => {
    expect(BUILTIN_PRESETS[0]?.id).toBe('default')
    expect(sameSettings(BUILTIN_PRESETS[0]!.create(), defaultSettings())).toBe(true)
  })

  it('are all different from each other', () => {
    for (const a of BUILTIN_PRESETS) {
      for (const b of BUILTIN_PRESETS) {
        if (a !== b) expect(sameSettings(a.create(), b.create()), `${a.id} vs ${b.id}`).toBe(false)
      }
    }
  })

  it('only name plugins that are in the catalog', () => {
    const known = new Set(PLUGINS.map((p) => p.id))
    for (const preset of BUILTIN_PRESETS) {
      for (const id of Object.keys(preset.create().plugins)) {
        expect(known.has(id), `${preset.id}: ${id}`).toBe(true)
      }
    }
  })

  it('return a fresh object every time', () => {
    const preset = BUILTIN_PRESETS[1]!
    const first = preset.create()
    first.plugins.removeComments = false
    expect(preset.create().plugins.removeComments).toBe(true)
  })

  it('keep ids and groups in "Keep structure"', () => {
    const safe = BUILTIN_PRESETS.find((p) => p.id === 'safe')!.create()
    expect(safe.plugins.cleanupIds).toBe(false)
    expect(safe.plugins.collapseGroups).toBe(false)
  })

  it('remove width, height and xmlns in "Inline icons"', () => {
    const inline = BUILTIN_PRESETS.find((p) => p.id === 'inline')!.create()
    expect(inline.plugins).toMatchObject({
      removeDimensions: true,
      removeXMLNS: true,
    })
  })
})

describe('sameSettings', () => {
  const base = defaultSettings()

  it('notices a change in any global option', () => {
    expect(sameSettings(base, { ...base, multipass: !base.multipass })).toBe(false)
    expect(sameSettings(base, { ...base, pretty: !base.pretty })).toBe(false)
    expect(sameSettings(base, { ...base, floatPrecision: 1 })).toBe(false)
    expect(sameSettings(base, { ...base, transformPrecision: 1 })).toBe(false)
  })

  it('notices a single plugin switch', () => {
    const changed = cloneSettings(base)
    changed.plugins.removeTitle = true
    expect(sameSettings(base, changed)).toBe(false)
  })

  it('treats a missing plugin entry as its default', () => {
    const plugins = { ...base.plugins }
    delete plugins.removeTitle
    expect(sameSettings(base, { ...base, plugins })).toBe(true)
  })
})

describe('cloneSettings', () => {
  it('makes a copy that shares no objects with the original', () => {
    const original = defaultSettings()
    const copy = cloneSettings(original)
    copy.plugins.removeComments = false
    expect(original.plugins.removeComments).toBe(true)
  })
})
