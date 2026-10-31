import { useFileOpener } from '@/composables/useFileOpener'
import { iconDemo, iconOpen, iconPaste } from '@/icons'

export interface InputAction {
  key: 'open' | 'paste' | 'demo'
  icon: string
  /** Undefined while the action isn't implemented yet: the button renders disabled. */
  run?: () => void
}

/** The three ways to bring in an SVG, shared by the header and the empty state. */
export function useInputActions(): InputAction[] {
  const { openFile } = useFileOpener()

  return [
    { key: 'open', icon: iconOpen, run: openFile },
    { key: 'paste', icon: iconPaste },
    { key: 'demo', icon: iconDemo },
  ]
}
