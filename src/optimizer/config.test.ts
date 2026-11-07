import { describe, expect, it } from 'vitest'
import {
  buildSvgoConfig,
  defaultSettings,
  isPluginEnabled,
  mergeWithDefaults,
  PRECISION_MAX,
} from './config'
import { PLUGINS } from './plugins'

type PluginEntry = string | { name: string; params?: Record<string, unknown> }

const pluginNames = (entries: unknown) =>
  (entries as PluginEntry[]).map((entry) => (typeof entry === 'string' ? entry : entry.name))

describe('buildSvgoConfig', () => {
  it('passes the global options through', () => {
    const config = buildSvgoConfig({ ...defaultSettings(), multipass: false, pretty: true })
    expect(config.multipass).toBe(false)
    expect(config.floatPrecision).toBe(3)
    expect(config.js2svg).toEqual({ pretty: true, indent: 2 })
  })

  it('lists enabled plugins in catalog order and skips disabled ones', () => {
    const settings = defaultSettings()
    settings.plugins.removeComments = false
    settings.plugins.removeTitle = true

    const names = pluginNames(buildSvgoConfig(settings).plugins)
    expect(names).not.toContain('removeComments')
    expect(names).toContain('removeTitle')

    const catalogOrder = PLUGINS.map((p) => p.id).filter((id) => names.includes(id))
    expect(names).toEqual(catalogOrder)
  })

  it('gives transform precision to the plugins that take it', () => {
    const config = buildSvgoConfig({ ...defaultSettings(), transformPrecision: 2 })
    const entries = config.plugins as PluginEntry[]
    expect(entries).toContainEqual({ name: 'convertTransform', params: { transformPrecision: 2 } })
    expect(entries).toContainEqual({ name: 'convertPathData', params: { transformPrecision: 2 } })
  })

  it('clamps precision into the supported range', () => {
    expect(buildSvgoConfig({ ...defaultSettings(), floatPrecision: -4 }).floatPrecision).toBe(0)
    expect(buildSvgoConfig({ ...defaultSettings(), floatPrecision: 99 }).floatPrecision).toBe(
      PRECISION_MAX,
    )
    expect(buildSvgoConfig({ ...defaultSettings(), floatPrecision: 2.6 }).floatPrecision).toBe(3)
    expect(buildSvgoConfig({ ...defaultSettings(), floatPrecision: NaN }).floatPrecision).toBe(
      PRECISION_MAX,
    )
  })
})

describe('mergeWithDefaults', () => {
  it('fills in everything missing from old or partial storage', () => {
    const merged = mergeWithDefaults({ multipass: false, plugins: { removeComments: false } })
    expect(merged.multipass).toBe(false)
    expect(merged.floatPrecision).toBe(defaultSettings().floatPrecision)
    expect(merged.plugins.removeComments).toBe(false)
    // A plugin the stored settings never knew about gets its default.
    expect(merged.plugins.removeDoctype).toBe(true)
    expect(Object.keys(merged.plugins)).toHaveLength(PLUGINS.length)
  })

  it('copes with storage that has no plugins at all', () => {
    expect(mergeWithDefaults({}).plugins).toEqual(defaultSettings().plugins)
  })
})

describe('isPluginEnabled', () => {
  it('falls back to the catalog default for unknown entries', () => {
    const settings = { ...defaultSettings(), plugins: {} }
    expect(isPluginEnabled(settings, 'removeDoctype')).toBe(true)
    expect(isPluginEnabled(settings, 'removeTitle')).toBe(false)
    expect(isPluginEnabled(settings, 'noSuchPlugin')).toBe(false)
  })
})
