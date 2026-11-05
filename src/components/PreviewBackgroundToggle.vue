<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { type PreviewBackground, useSettingsStore } from '@/stores/settings'

/**
 * The preview has its own background, independent of the app theme:
 * a dark icon would vanish on the dark theme otherwise.
 */
const settings = useSettingsStore()

const { t } = useI18n()
const { xs } = useDisplay()

const options: PreviewBackground[] = ['checkerboard', 'light', 'dark']

/** On phones a single button cycles through the options, to save toolbar space. */
function cycle() {
  const index = options.indexOf(settings.previewBackground)
  settings.previewBackground = options[(index + 1) % options.length] ?? 'checkerboard'
}

const cycleLabel = computed(
  () => `${t('previewBg.label')}: ${t(`previewBg.${settings.previewBackground}`)}`,
)
</script>

<template>
  <v-btn
    v-if="xs"
    variant="outlined"
    size="small"
    rounded="lg"
    class="bg-cycle"
    :aria-label="cycleLabel"
    @click="cycle"
  >
    <span class="swatch" :class="`swatch--${settings.previewBackground}`" />
  </v-btn>
  <v-btn-toggle
    v-else
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
.bg-cycle {
  min-width: 40px;
  height: 32px;
  padding: 0 10px;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
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
