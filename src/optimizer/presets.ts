import { defaultSettings, isPluginEnabled, type OptimizerSettings } from './config'
import { PLUGINS } from './plugins'

/**
 * Ready-made optimizer settings. Names and descriptions live in i18n
 * under `presets.builtins.<id>`.
 */
export interface BuiltinPreset {
  id: 'default' | 'safe' | 'maximum' | 'inline'
  create: () => OptimizerSettings
}

function withPlugins(
  changes: Record<string, boolean>,
  base = defaultSettings(),
): OptimizerSettings {
  return { ...base, plugins: { ...base.plugins, ...changes } }
}

export const BUILTIN_PRESETS: readonly BuiltinPreset[] = [
  // SVGO's own preset-default (plus removeScripts, see plugins.ts).
  { id: 'default', create: defaultSettings },

  // For SVG that CSS or JavaScript reaches into: ids, groups and shapes stay as written.
  {
    id: 'safe',
    create: () =>
      withPlugins({
        cleanupIds: false,
        collapseGroups: false,
        convertShapeToPath: false,
        mergePaths: false,
        moveElemsAttrsToGroup: false,
        moveGroupAttrsToElems: false,
      }),
  },

  // Smallest output: lower precision and the extra plugins that are safe for most files.
  {
    id: 'maximum',
    create: () =>
      withPlugins(
        {
          cleanupListOfValues: true,
          convertOneStopGradients: true,
          removeOffCanvasPaths: true,
          reusePaths: true,
          removeDimensions: true,
          removeXlink: true,
        },
        { ...defaultSettings(), floatPrecision: 2, transformPrecision: 3 },
      ),
  },

  // For SVG pasted straight into HTML or a Vue template: size comes from CSS.
  {
    id: 'inline',
    create: () =>
      withPlugins({
        removeDimensions: true,
        removeXMLNS: true,
        removeXlink: true,
      }),
  },
]

/** True when two settings would produce the same SVGO run. */
export function sameSettings(a: OptimizerSettings, b: OptimizerSettings): boolean {
  return (
    a.multipass === b.multipass &&
    a.floatPrecision === b.floatPrecision &&
    a.transformPrecision === b.transformPrecision &&
    a.pretty === b.pretty &&
    PLUGINS.every((plugin) => isPluginEnabled(a, plugin.id) === isPluginEnabled(b, plugin.id))
  )
}

/** A deep copy, so a preset never shares objects with the live settings. */
export function cloneSettings(settings: OptimizerSettings): OptimizerSettings {
  return { ...settings, plugins: { ...settings.plugins } }
}
