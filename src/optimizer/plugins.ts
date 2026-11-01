/**
 * Every SVGO plugin the UI offers, in the order SVGO runs them.
 *
 * The order follows SVGO's preset-default, with the extra (off by default) plugins
 * slotted in where they make sense. Plugins that need user-written parameters
 * (removeAttrs, addAttributesToSVGElement, prefixIds…) are left out.
 *
 * Labels live in i18n under `plugins.<id>`; the group only affects how the
 * settings panel lists them, never the run order.
 */

export type PluginGroup = 'cleanup' | 'numbers' | 'structure' | 'styles' | 'compat'

export interface PluginInfo {
  id: string
  group: PluginGroup
  /** On in a fresh setup. True for preset-default plugins, plus removeScripts. */
  defaultEnabled: boolean
}

const on = (id: string, group: PluginGroup): PluginInfo => ({ id, group, defaultEnabled: true })
const off = (id: string, group: PluginGroup): PluginInfo => ({ id, group, defaultEnabled: false })

export const PLUGINS: readonly PluginInfo[] = [
  on('removeDoctype', 'cleanup'),
  on('removeXMLProcInst', 'cleanup'),
  on('removeComments', 'cleanup'),
  // Not in preset-default, but on by default here: an optimized SVG has no reason to run code.
  on('removeScripts', 'cleanup'),
  on('removeDeprecatedAttrs', 'compat'),
  on('removeMetadata', 'cleanup'),
  off('removeTitle', 'compat'),
  on('removeEditorsNSData', 'cleanup'),
  on('cleanupAttrs', 'cleanup'),
  on('mergeStyles', 'styles'),
  off('removeStyleElement', 'styles'),
  on('inlineStyles', 'styles'),
  on('minifyStyles', 'styles'),
  off('convertStyleToAttrs', 'styles'),
  on('cleanupIds', 'structure'),
  on('removeUselessDefs', 'structure'),
  off('removeRasterImages', 'cleanup'),
  on('cleanupNumericValues', 'numbers'),
  off('cleanupListOfValues', 'numbers'),
  on('convertColors', 'styles'),
  off('convertOneStopGradients', 'styles'),
  on('removeUnknownsAndDefaults', 'cleanup'),
  on('removeNonInheritableGroupAttrs', 'structure'),
  on('removeUselessStrokeAndFill', 'styles'),
  off('removeViewBox', 'compat'),
  on('cleanupEnableBackground', 'cleanup'),
  on('removeHiddenElems', 'cleanup'),
  off('removeOffCanvasPaths', 'cleanup'),
  on('removeEmptyText', 'cleanup'),
  on('convertShapeToPath', 'numbers'),
  on('convertEllipseToCircle', 'numbers'),
  on('moveElemsAttrsToGroup', 'structure'),
  on('moveGroupAttrsToElems', 'structure'),
  on('collapseGroups', 'structure'),
  on('convertPathData', 'numbers'),
  on('convertTransform', 'numbers'),
  on('removeEmptyAttrs', 'cleanup'),
  on('removeEmptyContainers', 'structure'),
  on('mergePaths', 'numbers'),
  off('reusePaths', 'structure'),
  on('removeUnusedNS', 'cleanup'),
  off('removeDimensions', 'compat'),
  off('removeXMLNS', 'compat'),
  off('removeXlink', 'compat'),
  on('sortAttrs', 'structure'),
  on('sortDefsChildren', 'structure'),
  on('removeDesc', 'compat'),
]

export const PLUGIN_GROUPS: readonly PluginGroup[] = [
  'cleanup',
  'numbers',
  'structure',
  'styles',
  'compat',
]

/** Plugins that accept a transformPrecision parameter. */
export const TRANSFORM_PRECISION_PLUGINS = new Set(['convertPathData', 'convertTransform'])

export function defaultPluginState(): Record<string, boolean> {
  return Object.fromEntries(PLUGINS.map((plugin) => [plugin.id, plugin.defaultEnabled]))
}
