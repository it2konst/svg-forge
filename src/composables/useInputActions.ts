import { useDemo } from '@/composables/useDemo'
import { useFileOpener } from '@/composables/useFileOpener'
import { iconDemo, iconOpen, iconPaste } from '@/icons'
import { useUiStore } from '@/stores/ui'

export interface InputAction {
  key: 'open' | 'paste' | 'demo'
  icon: string
  run: () => void
}

/** The three ways to bring in an SVG, shared by the header and the empty state. */
export function useInputActions(): InputAction[] {
  const { openFile } = useFileOpener()
  const ui = useUiStore()
  const { loadDemo } = useDemo()

  return [
    { key: 'open', icon: iconOpen, run: openFile },
    { key: 'paste', icon: iconPaste, run: () => (ui.pasteDialogOpen = true) },
    { key: 'demo', icon: iconDemo, run: loadDemo },
  ]
}
