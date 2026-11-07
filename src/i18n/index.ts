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

/**
 * Russian plural forms for messages written as "zero | one | few | many":
 * 0 файлов, 1 файл, 2 файла, 5 файлов, 11 файлов, 21 файл, 22 файла.
 */
export function russianPluralRule(choice: number, choicesLength: number): number {
  if (choice === 0) return 0
  const lastDigit = choice % 10
  const lastTwo = choice % 100
  const teen = lastTwo > 10 && lastTwo < 20
  if (!teen && lastDigit === 1) return 1
  if (!teen && lastDigit >= 2 && lastDigit <= 4) return 2
  return choicesLength < 4 ? 2 : 3
}

export function createAppI18n(initialLocale: AppLocale) {
  return createI18n<[MessageSchema], AppLocale>({
    legacy: false, // Composition API mode, required by Vuetify's adapter
    locale: initialLocale,
    fallbackLocale: 'en',
    messages: { en, ru },
    pluralRules: { ru: russianPluralRule },
  })
}
