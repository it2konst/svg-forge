import { defineStore } from 'pinia'
import { ref } from 'vue'

export type StageView = 'image' | 'markup'

/** Transient UI state: not persisted, resets on reload. */
export const useUiStore = defineStore('ui', () => {
  const view = ref<StageView>('image')
  /** null = let the layout decide (open on wide screens, closed on narrow ones). */
  const settingsOpen = ref<boolean | null>(null)

  return { view, settingsOpen }
})
