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
  actions: {
    open: 'Open SVG',
    paste: 'Paste markup',
    demo: 'Try a demo',
    settings: 'Settings',
  },
  view: {
    label: 'View',
    image: 'Image',
    markup: 'Markup',
  },
  previewBg: {
    label: 'Preview background',
    checkerboard: 'Checkerboard',
    light: 'Light',
    dark: 'Dark',
  },
  empty: {
    title: 'Drop an SVG here',
    hint: 'Or open a file, paste markup, or try the demo. Your files never leave the browser.',
  },
  settings: {
    title: 'Settings',
    global: 'Global',
    optimizations: 'Optimizations',
    pending: 'Optimization options will appear here once SVGO is connected.',
  },
  stats: {
    original: 'Original',
    optimized: 'Optimized',
    noFile: 'No file yet',
  },
}

export default en
export type MessageSchema = typeof en
