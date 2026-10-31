import { useSvgLoader } from '@/composables/useSvgLoader'
// ?raw imports the file as a string at build time: no extra request, works offline.
import demoMarkup from '@/assets/demo.svg?raw'

export const DEMO_FILE_NAME = 'evening-hills.svg'

/** Loads a bundled, deliberately unoptimized SVG so people can try the app without a file. */
export function useDemo() {
  const { loadText } = useSvgLoader()

  function loadDemo() {
    loadText(demoMarkup, DEMO_FILE_NAME, 'demo')
  }

  return { loadDemo }
}
