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

export interface SizeChange {
  /** Signed percentage: "-71%" saved, "+3%" when the file grew. */
  text: string
  grew: boolean
}

/** Size change between two byte counts; null when there is nothing to compare with. */
export function formatChange(before: number, after: number, locale: string): SizeChange | null {
  if (before <= 0) return null
  const ratio = (after - before) / before
  return {
    text: new Intl.NumberFormat(locale, {
      style: 'percent',
      signDisplay: 'exceptZero',
      // Small changes keep one decimal, so "-0.4%" doesn't round to a misleading "0%".
      maximumFractionDigits: Math.abs(ratio) < 0.1 ? 1 : 0,
    }).format(ratio),
    grew: ratio > 0,
  }
}
