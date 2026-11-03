<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import EmptyState from '@/components/EmptyState.vue'
import PreviewBackgroundToggle from '@/components/PreviewBackgroundToggle.vue'
import StageStatus from '@/components/StageStatus.vue'
import SvgPreview from '@/components/SvgPreview.vue'
import { iconClose, iconCode, iconFile, iconPreview } from '@/icons'
import { useDocumentStore } from '@/stores/document'
import { useOptimizerStore } from '@/stores/optimizer'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

// CodeMirror is loaded only when someone opens the markup view.
const MarkupView = defineAsyncComponent(() => import('@/components/MarkupView.vue'))

const settings = useSettingsStore()
const ui = useUiStore()
const documentStore = useDocumentStore()
const optimizer = useOptimizerStore()
const { xs } = useDisplay()

const viewOptions = [
  { value: 'image', icon: iconPreview },
  { value: 'markup', icon: iconCode },
] as const

const doc = computed(() => documentStore.current)
const showImage = computed(() => !doc.value || ui.view === 'image')

/** What the stage shows: the optimized result, unless the user asked for the original. */
const displayed = computed(() => {
  if (!doc.value) return null
  const optimized = !ui.showOriginal ? optimizer.result : null
  return optimized
    ? { markup: optimized.markup, isOriginal: false }
    : { markup: doc.value.markup, isOriginal: true }
})
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
        :disabled="!doc"
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

      <div v-if="doc" class="stage__file">
        <v-icon :icon="iconFile" size="small" class="stage__file-icon" />
        <span class="stage__file-name" :title="doc.name">{{ doc.name }}</span>
        <v-btn
          icon
          size="x-small"
          density="comfortable"
          :aria-label="$t('document.close')"
          @click="documentStore.close()"
        >
          <v-icon :icon="iconClose" />
          <v-tooltip activator="parent">{{ $t('document.close') }}</v-tooltip>
        </v-btn>
      </div>
      <v-spacer v-else />

      <PreviewBackgroundToggle v-if="showImage" />
    </div>

    <div
      class="stage__canvas"
      :class="showImage ? `stage__canvas--${settings.previewBackground}` : 'stage__canvas--markup'"
    >
      <EmptyState v-if="!doc || !displayed" />
      <SvgPreview v-else-if="ui.view === 'image'" :markup="displayed.markup" :alt="doc.name" />
      <MarkupView v-else :markup="displayed.markup" :label="$t('view.markup')" />
      <span v-if="displayed?.isOriginal" class="stage__badge">{{ $t('stage.original') }}</span>
    </div>

    <StageStatus />
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
.stage__file {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}
.stage__file-icon {
  opacity: var(--v-medium-emphasis-opacity);
}
.stage__file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 550;
}
.stage__canvas {
  position: relative;
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
.stage__canvas--markup {
  background: rgb(var(--v-theme-surface));
}
.stage__badge {
  position: absolute;
  inset-block-start: 12px;
  inset-inline-start: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  pointer-events: none;
}
</style>
