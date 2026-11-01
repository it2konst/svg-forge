import type { Config } from 'svgo/browser'
import { defaultPluginState, PLUGINS, TRANSFORM_PRECISION_PLUGINS } from './plugins'

export interface OptimizerSettings {
  /** Repeat the plugin passes until the output stops shrinking. */
  multipass: boolean
  /** Digits after the decimal point for coordinates and other numbers. */
  floatPrecision: number
  /** Digits after the decimal point inside transforms. */
  transformPrecision: number
  /** Indented, readable output instead of one long line. */
  pretty: boolean
  plugins: Record<string, boolean>
}

export const PRECISION_MIN = 0
export const PRECISION_MAX = 8

export function defaultSettings(): OptimizerSettings {
  return {
    multipass: true,
    floatPrecision: 3,
    transformPrecision: 5,
    pretty: false,
    plugins: defaultPluginState(),
  }
}

/** Settings from storage may be old, partial or hand-edited: fill gaps with defaults. */
export function mergeWithDefaults(stored: Partial<OptimizerSettings>): OptimizerSettings {
  const defaults = defaultSettings()
  return {
    ...defaults,
    ...stored,
    // Plugins added in a later version get their default instead of being undefined.
    plugins: { ...defaults.plugins, ...stored.plugins },
  }
}

function clampPrecision(value: number): number {
  if (!Number.isFinite(value)) return PRECISION_MAX
  return Math.min(PRECISION_MAX, Math.max(PRECISION_MIN, Math.round(value)))
}

export function isPluginEnabled(settings: OptimizerSettings, id: string): boolean {
  return settings.plugins[id] ?? PLUGINS.find((p) => p.id === id)?.defaultEnabled ?? false
}

/** Translates UI settings into an SVGO config. */
export function buildSvgoConfig(settings: OptimizerSettings): Config {
  const transformPrecision = clampPrecision(settings.transformPrecision)

  const plugins = PLUGINS.filter((plugin) => isPluginEnabled(settings, plugin.id)).map((plugin) =>
    TRANSFORM_PRECISION_PLUGINS.has(plugin.id)
      ? { name: plugin.id, params: { transformPrecision } }
      : plugin.id,
  )

  return {
    multipass: settings.multipass,
    // SVGO passes this to every plugin that has a floatPrecision parameter.
    floatPrecision: clampPrecision(settings.floatPrecision),
    js2svg: { pretty: settings.pretty, indent: 2 },
    // Ids come from our own catalog, checked against SVGO's builtins.
    plugins: plugins as Config['plugins'],
  }
}
