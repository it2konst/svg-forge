/** Naming helpers that turn a file name into code identifiers. */

/** "icons/Arrow Left.svg" -> "Arrow Left" */
export function baseName(fileName: string): string {
  return (fileName.split(/[\\/]/).pop() ?? fileName).replace(/\.svg$/i, '')
}

/** Latin letters and digits only: words split on anything else and on camelCase humps. */
function words(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
}

/** "evening-hills" -> "EveningHills". Always a valid Vue component name. */
export function toPascalCase(name: string, fallback = 'SvgIcon'): string {
  const result = words(name)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  if (!result) return fallback
  return /^\d/.test(result) ? `Svg${result}` : result
}

/** "Evening Hills" -> "evening-hills". Always a valid CSS class name. */
export function toKebabCase(name: string, fallback = 'svg-icon'): string {
  const result = words(name)
    .map((word) => word.toLowerCase())
    .join('-')
  if (!result) return fallback
  return /^\d/.test(result) ? `svg-${result}` : result
}

export function isValidComponentName(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name)
}

export function isValidClassName(name: string): boolean {
  return /^-?[A-Za-z_][A-Za-z0-9_-]*$/.test(name)
}
