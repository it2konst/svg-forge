<script setup lang="ts">
import { type PreviewBackground, useSettingsStore } from '@/stores/settings'

/**
 * The preview has its own background, independent of the app theme:
 * a dark icon would vanish on the dark theme otherwise.
 */
const settings = useSettingsStore()

const options: PreviewBackground[] = ['checkerboard', 'light', 'dark']
</script>

<template>
  <v-btn-toggle
    v-model="settings.previewBackground"
    mandatory
    density="compact"
    rounded="lg"
    variant="outlined"
    divided
    :aria-label="$t('previewBg.label')"
  >
    <v-btn
      v-for="option in options"
      :key="option"
      :value="option"
      size="small"
      :aria-label="$t(`previewBg.${option}`)"
    >
      <span class="swatch" :class="`swatch--${option}`" />
      <v-tooltip activator="parent">{{ $t(`previewBg.${option}`) }}</v-tooltip>
    </v-btn>
  </v-btn-toggle>
</template>

<style scoped>
.swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(var(--v-border-color), 0.3);
}
.swatch--checkerboard {
  background: repeating-conic-gradient(#ffffff 0 25%, #c9c9c4 0 50%) 0 0 / 8px 8px;
}
.swatch--light {
  background: var(--app-preview-light);
}
.swatch--dark {
  background: var(--app-preview-dark);
}
</style>
