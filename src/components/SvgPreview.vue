<script setup lang="ts">
import { useSvgBlobUrl } from '@/composables/useSvgBlobUrl'

/** Renders SVG markup safely, through <img src="blob:…"> (see useSvgBlobUrl). */
const props = defineProps<{ markup: string; alt: string }>()

const src = useSvgBlobUrl(() => props.markup)
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
