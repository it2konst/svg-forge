import { useEventListener } from '@vueuse/core'
import { useSvgLoader } from '@/composables/useSvgLoader'
import { useUiStore } from '@/stores/ui'
import { looksLikeSvgFile, looksLikeSvgText } from '@/utils/svg'

export const PASTED_FILE_NAME = 'pasted.svg'

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.closest('input, textarea, [contenteditable]') !== null)
  )
}

/**
 * Ctrl+V / ⌘V anywhere on the page loads SVG from the clipboard:
 * a copied .svg file or copied <svg> markup. Pasting into text fields works as usual,
 * and other clipboard content is ignored.
 */
export function usePasteListener() {
  const ui = useUiStore()
  const { loadFile, loadText } = useSvgLoader()

  useEventListener(window, 'paste', (event: ClipboardEvent) => {
    if (ui.pasteDialogOpen || isEditable(event.target) || !event.clipboardData) return

    const file = Array.from(event.clipboardData.files).find(looksLikeSvgFile)
    if (file) {
      event.preventDefault()
      void loadFile(file)
      return
    }

    const text = event.clipboardData.getData('text/plain')
    if (looksLikeSvgText(text)) {
      event.preventDefault()
      loadText(text, PASTED_FILE_NAME, 'paste')
    }
  })
}
