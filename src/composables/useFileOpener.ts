import { createSharedComposable, useEventListener, useFileDialog } from '@vueuse/core'
import { useBatchInput } from '@/composables/useBatchInput'
import { useSvgLoader } from '@/composables/useSvgLoader'

/**
 * "Open SVG" for the whole app: one hidden file input shared by every button
 * (createSharedComposable), plus the Ctrl+O / ⌘O shortcut.
 * One file opens in the editor; several go to the batch list.
 */
export const useFileOpener = createSharedComposable(() => {
  const { loadFile } = useSvgLoader()
  const { addToBatch, shouldBatch } = useBatchInput()

  const { open, onChange } = useFileDialog({
    accept: '.svg,image/svg+xml',
    multiple: true,
    reset: true, // so choosing the same file again still triggers a load
  })

  onChange((fileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    if (shouldBatch(files.length)) void addToBatch(files)
    else void loadFile(files[0] as File)
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
