<script setup lang="ts">
import { useDisplay } from 'vuetify'
import EmptyState from '@/components/EmptyState.vue'
import PreviewBackgroundToggle from '@/components/PreviewBackgroundToggle.vue'
import { iconCode, iconPreview } from '@/icons'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

const settings = useSettingsStore()
const ui = useUiStore()
const { xs } = useDisplay()

const viewOptions = [
  { value: 'image', icon: iconPreview },
  { value: 'markup', icon: iconCode },
] as const
</script>

<template>
  <section class="stage">
    <div class="stage__toolbar">
      <v-btn-toggle
        v-model="ui.view"
        mandatory
        density="compact"
        rounded="lg"
        variant="outlined"
        divided
        :aria-label="$t('view.label')"
      >
        <v-btn
          v-for="option in viewOptions"
          :key="option.value"
          :value="option.value"
          size="small"
          :aria-label="$t(`view.${option.value}`)"
        >
          <v-icon :icon="option.icon" :start="!xs" />
          <span v-if="!xs">{{ $t(`view.${option.value}`) }}</span>
        </v-btn>
      </v-btn-toggle>

      <v-spacer />

      <PreviewBackgroundToggle v-if="ui.view === 'image'" />
    </div>

    <div class="stage__canvas" :class="`stage__canvas--${settings.previewBackground}`">
      <EmptyState />
    </div>

    <footer class="stage__status">
      <span>{{ $t('stats.original') }}: —</span>
      <span>{{ $t('stats.optimized') }}: —</span>
      <v-spacer />
      <span v-if="!xs" class="stage__status-note">{{ $t('stats.noFile') }}</span>
    </footer>
  </section>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.stage__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}
.stage__canvas {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
/* Checkerboard reveals transparent areas; its two tones follow the app theme. */
.stage__canvas--checkerboard {
  background: repeating-conic-gradient(
      rgb(var(--v-theme-checker-a)) 0 25%,
      rgb(var(--v-theme-checker-b)) 0 50%
    )
    0 0 / 20px 20px;
}
/* Fixed backgrounds, independent of the theme, for checking real-world contrast. */
.stage__canvas--light {
  background: var(--app-preview-light);
}
.stage__canvas--dark {
  background: var(--app-preview-dark);
}
.stage__status {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 16px;
  font-size: 0.8125rem;
  white-space: nowrap;
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}
.stage__status-note {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
