import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

/**
 * Icons are imported as SVG paths from @mdi/js (see src/icons.ts),
 * so only the icons we use end up in the bundle — no icon font.
 */
export default createVuetify({
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
