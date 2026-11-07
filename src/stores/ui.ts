import { defineStore } from 'pinia'
import { ref } from 'vue'

export type StageView = 'image' | 'compare' | 'markup'
/** One file in the editor, or the list of a batch. */
export type WorkspaceMode = 'single' | 'batch'

/** Transient UI state: not persisted, resets on reload. */
export const useUiStore = defineStore('ui', () => {
  const view = ref<StageView>('image')
  /** null = let the layout decide (open on wide screens, closed on narrow ones). */
  const settingsOpen = ref<boolean | null>(null)
  const pasteDialogOpen = ref(false)
  /** Preview and markup show the original instead of the optimized result. */
  const showOriginal = ref(false)
  const exportDialogOpen = ref(false)
  const mode = ref<WorkspaceMode>('single')

  return { view, settingsOpen, pasteDialogOpen, showOriginal, exportDialogOpen, mode }
})
