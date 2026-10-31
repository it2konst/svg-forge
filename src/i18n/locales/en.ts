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
  paste: {
    title: 'Paste SVG markup',
    placeholder: '<svg xmlns="http://www.w3.org/2000/svg" …',
    hint: 'Tip: you can also press Ctrl+V anywhere on the page to paste an SVG.',
    cancel: 'Cancel',
    submit: 'Open',
  },
  document: {
    close: 'Close file',
  },
  notifications: {
    close: 'Close',
  },
  errors: {
    empty: 'The input is empty. Paste SVG markup or choose a file.',
    tooLarge: 'This file is over 10 MB, which is too large to optimize in the browser.',
    notSvg: 'This is not an SVG. Choose a file with the .svg extension or paste <svg> markup.',
    invalidXml: 'This SVG has broken markup and cannot be read. Check that every tag is closed.',
    readFailed: 'The file could not be read. Try opening it again.',
  },
  units: {
    b: 'B',
    kb: 'KB',
    mb: 'MB',
  },
  stats: {
    original: 'Original',
    optimized: 'Optimized',
    noFile: 'No file yet',
  },
}

export default en
export type MessageSchema = typeof en
