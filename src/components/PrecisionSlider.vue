<script setup lang="ts">
import { useId } from 'vue'

/** A labelled integer slider with its current value shown next to the label. */
defineProps<{ label: string; min: number; max: number }>()
const model = defineModel<number>({ required: true })

const id = useId()
</script>

<template>
  <div class="precision-slider">
    <div class="precision-slider__header">
      <span :id="id" class="precision-slider__label">{{ label }}</span>
      <output class="precision-slider__value" aria-hidden="true">{{ model }}</output>
    </div>
    <v-slider
      v-model="model"
      :min="min"
      :max="max"
      :step="1"
      :aria-labelledby="id"
      color="primary"
      density="compact"
      hide-details
      show-ticks="always"
      tick-size="2"
    />
  </div>
</template>

<style scoped>
.precision-slider {
  margin-top: 8px;
}
.precision-slider__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.875rem;
}
.precision-slider__value {
  min-width: 2ch;
  text-align: end;
  font-weight: 650;
}
</style>
