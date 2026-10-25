import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { type AppLocale, detectBrowserLocale, isAppLocale } from '@/i18n'

export type ThemeMode = 'light' | 'dark' | 'system'
export type PreviewBackground = 'checkerboard' | 'light' | 'dark'

const STORAGE_PREFIX = 'svg-forge:'

/**
 * User preferences that survive reloads (stored in localStorage).
 * useStorage falls back to the default value if storage is unavailable
 * (private mode, blocked site data), so the app still works without it.
 */
export const useSettingsStore = defineStore('settings', () => {
  const themeMode = useStorage<ThemeMode>(`${STORAGE_PREFIX}theme`, 'system')
  const locale = useStorage<AppLocale>(`${STORAGE_PREFIX}locale`, detectBrowserLocale())
  const previewBackground = useStorage<PreviewBackground>(
    `${STORAGE_PREFIX}preview-bg`,
    'checkerboard',
  )

  // A hand-edited or outdated value in storage must not break the UI.
  if (!isAppLocale(locale.value)) locale.value = detectBrowserLocale()

  return { themeMode, locale, previewBackground }
})
