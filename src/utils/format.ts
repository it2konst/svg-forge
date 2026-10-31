export type ByteUnit = 'b' | 'kb' | 'mb'

/**
 * Splits a byte count into a localized number and a unit key.
 * The unit label itself comes from i18n (B / KB / MB, Б / КБ / МБ).
 */
export function splitBytes(bytes: number, locale: string): { value: string; unit: ByteUnit } {
  if (bytes < 1024) {
    return { value: new Intl.NumberFormat(locale).format(bytes), unit: 'b' }
  }
  const kb = bytes / 1024
  if (kb < 1024) {
    return {
      value: new Intl.NumberFormat(locale, { maximumFractionDigits: kb < 10 ? 2 : 1 }).format(kb),
      unit: 'kb',
    }
  }
  return {
    value: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(kb / 1024),
    unit: 'mb',
  }
}
