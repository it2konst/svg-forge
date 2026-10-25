import { createI18n } from 'vue-i18n'
import en, { type MessageSchema } from './locales/en'
import ru from './locales/ru'

export const SUPPORTED_LOCALES = ['en', 'ru'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

/** Language names are shown in their own language, so anyone can find theirs. */
export const LOCALE_NAMES: Record<AppLocale, string> = {
  en: 'English',
  ru: 'Русский',
}

export function isAppLocale(value: unknown): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}

/** First visit: pick the browser's language if we support it, otherwise English. */
export function detectBrowserLocale(): AppLocale {
  const preferred = typeof navigator !== 'undefined' ? navigator.languages : []
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if (isAppLocale(base)) return base
  }
  return 'en'
}

export function createAppI18n(initialLocale: AppLocale) {
  return createI18n<[MessageSchema], AppLocale>({
    legacy: false, // Composition API mode, required by Vuetify's adapter
    locale: initialLocale,
    fallbackLocale: 'en',
    messages: { en, ru },
  })
}
