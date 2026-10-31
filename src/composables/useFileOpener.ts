import { createSharedComposable, useEventListener, useFileDialog } from '@vueuse/core'
import { useSvgLoader } from '@/composables/useSvgLoader'

/**
 * "Open SVG" for the whole app: one hidden file input shared by every button
 * (createSharedComposable), plus the Ctrl+O / ⌘O shortcut.
 */
export const useFileOpener = createSharedComposable(() => {
  const { loadFile } = useSvgLoader()

  const { open, onChange } = useFileDialog({
    accept: '.svg,image/svg+xml',
    multiple: false,
    reset: true, // so choosing the same file again still triggers a load
  })

  onChange((files) => {
    const file = files?.[0]
    if (file) void loadFile(file)
  })

  function openFile() {
    open()
  }

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'o') {
      event.preventDefault() // otherwise the browser opens its own "Open file" dialog
      openFile()
    }
  })

  return { openFile }
})
