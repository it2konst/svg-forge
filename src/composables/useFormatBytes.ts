import { useI18n } from 'vue-i18n'
import { splitBytes } from '@/utils/format'

/** formatBytes(12800) → "12.5 KB" in English, "12,5 КБ" in Russian. */
export function useFormatBytes() {
  const { t, locale } = useI18n()

  function formatBytes(bytes: number): string {
    const { value, unit } = splitBytes(bytes, locale.value)
    return `${value} ${t(`units.${unit}`)}`
  }

  return { formatBytes }
}
