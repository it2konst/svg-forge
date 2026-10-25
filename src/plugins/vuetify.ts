import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { darkTheme, lightTheme } from '@/theme/themes'
import type { ThemeMode } from '@/stores/settings'

/**
 * Icons are imported as SVG paths from @mdi/js (see src/icons.ts),
 * so only the icons we use end up in the bundle — no icon font.
 *
 * The initial theme is passed in from the settings store so the page
 * renders in the saved theme right away, without a light-to-dark flash.
 */
export function createAppVuetify(initialTheme: ThemeMode) {
  return createVuetify({
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
