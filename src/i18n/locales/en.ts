import { en as vuetifyEn } from 'vuetify/locale'

/** English is the source of truth: other locales must match this shape. */
const en = {
  $vuetify: vuetifyEn,
  app: {
    name: 'svg-forge',
  },
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  language: {
    label: 'Language',
  },
}

export default en
export type MessageSchema = typeof en
