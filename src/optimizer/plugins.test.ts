// @vitest-environment node
import { builtinPlugins } from 'svgo/browser'
import { describe, expect, it } from 'vitest'
import { defaultPluginState, PLUGIN_GROUPS, PLUGINS, TRANSFORM_PRECISION_PLUGINS } from './plugins'

/**
 * The catalog is written by hand. These tests compare it with the SVGO version
 * that is actually installed, so an SVGO upgrade that renames, removes or
 * reorders plugins fails here instead of silently in the browser.
 */
const builtinNames = new Set<string>(builtinPlugins.map((plugin) => plugin.name))
const presetDefault = builtinPlugins.find((plugin) => plugin.name === 'preset-default')
const presetNames: string[] =
  presetDefault && 'plugins' in presetDefault && Array.isArray(presetDefault.plugins)
    ? (presetDefault.plugins as readonly { name: string }[]).map((plugin) => plugin.name)
    : []

describe('plugin catalog', () => {
  it('found preset-default in SVGO', () => {
    expect(presetNames.length).toBeGreaterThan(20)
  })

  it('only lists plugins that exist in SVGO', () => {
    const unknown = PLUGINS.map((plugin) => plugin.id).filter((id) => !builtinNames.has(id))
    expect(unknown).toEqual([])
  })

  it('lists every plugin once', () => {
    const ids = PLUGINS.map((plugin) => plugin.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes every preset-default plugin, switched on by default', () => {
    for (const name of presetNames) {
      expect(
        PLUGINS.find((plugin) => plugin.id === name),
        name,
      ).toMatchObject({
        defaultEnabled: true,
      })
    }
  })

  it('runs preset-default plugins in the same order as SVGO does', () => {
    const catalogOrder = PLUGINS.map((plugin) => plugin.id).filter((id) => presetNames.includes(id))
    expect(catalogOrder).toEqual(presetNames)
  })

  it('switches on removeScripts by default, although SVGO does not', () => {
    expect(presetNames).not.toContain('removeScripts')
    expect(defaultPluginState().removeScripts).toBe(true)
  })

  it('switches on nothing else outside preset-default', () => {
    const extrasOn = PLUGINS.filter((p) => p.defaultEnabled && !presetNames.includes(p.id))
    expect(extrasOn.map((p) => p.id)).toEqual(['removeScripts'])
  })

  it('puts every plugin in a known group', () => {
    for (const plugin of PLUGINS) expect(PLUGIN_GROUPS).toContain(plugin.group)
  })

  it('passes transform precision only to plugins in the catalog', () => {
    for (const id of TRANSFORM_PRECISION_PLUGINS) expect(builtinNames.has(id)).toBe(true)
  })
})
