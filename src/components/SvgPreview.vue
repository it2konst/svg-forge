<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue'

/**
 * Renders SVG markup safely.
 *
 * The markup becomes a Blob and is shown through <img src="blob:…">. An SVG loaded
 * as an image is sandboxed by the browser: scripts and event handlers never run and
 * external resources (images, fonts, CSS) never load. Never use v-html for user SVG.
 */
const props = defineProps<{ markup: string; alt: string }>()

const src = ref<string>()

function release() {
  if (src.value) URL.revokeObjectURL(src.value)
  src.value = undefined
}

watch(
  () => props.markup,
  (markup) => {
    release() // free the previous blob, or every new file would leak memory
    src.value = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  },
  { immediate: true },
)

onScopeDispose(release)
</script>

<template>
  <div class="svg-preview">
    <img v-if="src" :src="src" :alt="alt" class="svg-preview__image" />
  </div>
</template>

<style scoped>
.svg-preview {
  position: absolute;
  inset: 0;
  padding: clamp(16px, 4vw, 40px);
}
/* Fit the drawing into the stage whatever its own size; zoom comes later. */
.svg-preview__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
