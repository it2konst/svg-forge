<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import EmptyState from '@/components/EmptyState.vue'
import MarkupView from '@/components/MarkupView.vue'
import PreviewBackgroundToggle from '@/components/PreviewBackgroundToggle.vue'
import SvgPreview from '@/components/SvgPreview.vue'
import { useFormatBytes } from '@/composables/useFormatBytes'
import { iconClose, iconCode, iconFile, iconPreview } from '@/icons'
import { useDocumentStore } from '@/stores/document'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

const settings = useSettingsStore()
const ui = useUiStore()
const documentStore = useDocumentStore()
const { formatBytes } = useFormatBytes()
const { xs } = useDisplay()

const viewOptions = [
  { value: 'image', icon: iconPreview },
  { value: 'markup', icon: iconCode },
] as const

const doc = computed(() => documentStore.current)
const showImage = computed(() => !doc.value || ui.view === 'image')
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
      <EmptyState v-if="!doc" />
      <SvgPreview v-else-if="ui.view === 'image'" :markup="doc.markup" :alt="doc.name" />
      <MarkupView v-else :markup="doc.markup" :label="$t('view.markup')" />
    </div>

    <footer class="stage__status">
      <span>
        {{ $t('stats.original') }}: <strong>{{ doc ? formatBytes(doc.bytes) : '—' }}</strong>
      </span>
      <span>{{ $t('stats.optimized') }}: —</span>
      <v-spacer />
      <span v-if="!doc && !xs" class="stage__status-note">{{ $t('stats.noFile') }}</span>
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
.stage__status strong {
  font-weight: 600;
}
.stage__status-note {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
