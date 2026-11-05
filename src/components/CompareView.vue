<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSvgBlobUrl } from '@/composables/useSvgBlobUrl'
import { iconCompareHandle } from '@/icons'

/**
 * Before / after view: the original on the left, the optimized result on the right,
 * split by a divider you can drag, click to, or move with the arrow keys.
 * Both images are fitted into the same box, so they line up pixel for pixel.
 */
const props = defineProps<{ original: string; optimized: string; alt: string }>()

const { t } = useI18n()
const originalSrc = useSvgBlobUrl(() => props.original)
const optimizedSrc = useSvgBlobUrl(() => props.optimized)

/** Divider position, percent of the width from the left. */
const position = ref(50)
const dragging = ref(false)
const box = useTemplateRef<HTMLDivElement>('box')

const clamp = (value: number) => Math.min(100, Math.max(0, value))

function moveTo(clientX: number) {
  const rect = box.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return
  position.value = clamp(((clientX - rect.left) / rect.width) * 100)
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  dragging.value = true
  box.value?.setPointerCapture(event.pointerId) // keep dragging even outside the box
  moveTo(event.clientX)
}

function onPointerMove(event: PointerEvent) {
  if (dragging.value) moveTo(event.clientX)
}

function onPointerUp(event: PointerEvent) {
  dragging.value = false
  box.value?.releasePointerCapture(event.pointerId)
}

function onKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 2
  const moves: Record<string, number> = {
    ArrowLeft: position.value - step,
    ArrowDown: position.value - step,
    ArrowRight: position.value + step,
    ArrowUp: position.value + step,
    Home: 0,
    End: 100,
  }
  const next = moves[event.key]
  if (next === undefined) return
  event.preventDefault()
  position.value = clamp(next)
}

const rounded = computed(() => Math.round(position.value))
// Original on the left of the divider, optimized on the right.
const optimizedClip = computed(() => `inset(0 0 0 ${position.value}%)`)
</script>

<template>
  <div class="compare">
    <div
      ref="box"
      class="compare__box"
      :class="{ 'compare__box--dragging': dragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <img
        v-if="originalSrc"
        :src="originalSrc"
        :alt="`${alt}: ${t('stage.original')}`"
        class="compare__image"
        draggable="false"
      />
      <img
        v-if="optimizedSrc"
        :src="optimizedSrc"
        :alt="`${alt}: ${t('stage.optimized')}`"
        class="compare__image"
        :style="{ clipPath: optimizedClip }"
        draggable="false"
      />

      <div class="compare__divider" :style="{ left: `${position}%` }">
        <div
          class="compare__handle"
          role="slider"
          tabindex="0"
          :aria-label="t('compare.slider')"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="rounded"
          :aria-valuetext="t('compare.valueText', { percent: rounded })"
          @keydown="onKeydown"
        >
          <v-icon :icon="iconCompareHandle" size="20" />
        </div>
      </div>
    </div>

    <span class="compare__label compare__label--start">{{ t('stage.original') }}</span>
    <span class="compare__label compare__label--end">{{ t('stage.optimized') }}</span>
  </div>
</template>

<style scoped>
.compare {
  position: absolute;
  inset: 0;
  padding: clamp(16px, 4vw, 40px);
}
.compare__box {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: ew-resize;
  touch-action: none; /* dragging on a phone must not scroll the page */
  user-select: none;
}
.compare__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.compare__divider {
  position: absolute;
  inset-block: 0;
  width: 2px;
  margin-inline-start: -1px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-surface), 0.7);
  pointer-events: none;
}
.compare__handle {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  pointer-events: auto;
  cursor: ew-resize;
}
.compare__handle:focus-visible {
  outline: 3px solid rgba(var(--v-theme-primary), 0.45);
  outline-offset: 3px;
}
.compare__box--dragging .compare__handle {
  transform: translate(-50%, -50%) scale(1.08);
}
.compare__label {
  position: absolute;
  inset-block-start: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  pointer-events: none;
}
.compare__label--start {
  inset-inline-start: 12px;
}
.compare__label--end {
  inset-inline-end: 12px;
}
@media (prefers-reduced-motion: no-preference) {
  .compare__handle {
    transition: transform 120ms ease;
  }
}
</style>
