<script setup lang="ts">
import { useDropZone } from '@vueuse/core'
import { useBatchInput } from '@/composables/useBatchInput'
import { useSvgErrors } from '@/composables/useSvgErrors'
import { useSvgLoader } from '@/composables/useSvgLoader'
import { iconOpen } from '@/icons'
import { looksLikeSvgFile, SvgInputError } from '@/utils/svg'

/**
 * The whole window is a drop target. While a file is dragged over it,
 * an overlay shows where it will go.
 */
const { loadFile } = useSvgLoader()
const { reportError } = useSvgErrors()
const { addToBatch, shouldBatch } = useBatchInput()

const { isOverDropZone } = useDropZone(document, {
  // Only react to files: dragging selected text or a link around is not a drop.
  checkValidity: (items) => Array.from(items).some((item) => item.kind === 'file'),
  multiple: true,
  // Dropping a link or text must not navigate away from the app.
  preventDefaultForUnhandled: true,
  // One file opens in the editor; several go to the batch list.
  onDrop: async (dropped) => {
    const files = dropped ?? []
    if (!files.some(looksLikeSvgFile)) {
      reportError(new SvgInputError('notSvg'))
      return
    }
    if (shouldBatch(files.length)) await addToBatch(files)
    else await loadFile(files[0] as File)
  },
})
</script>

<template>
  <Transition name="drop-overlay">
    <div v-if="isOverDropZone" class="drop-overlay" aria-hidden="true">
      <div class="drop-overlay__frame">
        <v-icon :icon="iconOpen" size="48" />
        <p class="drop-overlay__text">{{ $t('drop.release') }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  padding: 16px;
  pointer-events: none; /* drag events must keep reaching the document */
  background: rgba(var(--v-theme-background), 0.82);
  backdrop-filter: blur(2px);
}
.drop-overlay__frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 3px dashed rgb(var(--v-theme-primary));
  border-radius: 24px;
  color: rgb(var(--v-theme-primary));
}
.drop-overlay__text {
  font-size: 1.375rem;
  font-weight: 650;
  letter-spacing: -0.01em;
}
.drop-overlay-enter-active,
.drop-overlay-leave-active {
  transition: opacity 120ms ease;
}
.drop-overlay-enter-from,
.drop-overlay-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .drop-overlay-enter-active,
  .drop-overlay-leave-active {
    transition: none;
  }
}
</style>
