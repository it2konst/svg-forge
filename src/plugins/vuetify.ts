import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { type I18n, useI18n } from 'vue-i18n'
import { darkTheme, lightTheme } from '@/theme/themes'
import type { ThemeMode } from '@/stores/settings'

/**
 * Icons are imported as SVG paths from @mdi/js (see src/icons.ts),
 * so only the icons we use end up in the bundle - no icon font.
 *
 * The initial theme is passed in from the settings store so the page
 * renders in the saved theme right away, without a light-to-dark flash.
 *
 * Vuetify's own strings (e.g. "No data available") go through vue-i18n,
 * so they switch language together with the rest of the app.
 */
export function createAppVuetify(initialTheme: ThemeMode, i18n: I18n) {
  return createVuetify({
    locale: {
      adapter: createVueI18nAdapter({ i18n, useI18n }),
    },
    theme: {
      defaultTheme: initialTheme,
      themes: { light: lightTheme, dark: darkTheme },
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    defaults: {
      VBtn: { variant: 'text', rounded: 'lg' },
      VTooltip: { location: 'bottom', openDelay: 400 },
    },
  })
}
