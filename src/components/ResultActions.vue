<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useResultExport } from '@/composables/useResultExport'
import { iconCopy, iconDownload } from '@/icons'
import { useOptimizerStore } from '@/stores/optimizer'

/** Floating actions in the corner of the stage: copy and download the optimized SVG. */
const { ready, download, copy } = useResultExport()
const optimizer = useOptimizerStore()
const { xs } = useDisplay()
</script>

<template>
  <div class="result-actions">
    <v-btn
      :disabled="!ready"
      :aria-label="$t('export.copy')"
      variant="tonal"
      color="primary"
      class="result-actions__copy"
      icon
      @click="copy"
    >
      <v-icon :icon="iconCopy" />
      <v-tooltip activator="parent" location="top">{{ $t('export.copy') }}</v-tooltip>
    </v-btn>

    <v-btn
      :disabled="!ready"
      :loading="optimizer.status === 'running'"
      :prepend-icon="xs ? undefined : iconDownload"
      :icon="xs"
      :aria-label="$t('export.download')"
      variant="flat"
      color="primary"
      size="large"
      rounded="xl"
      elevation="3"
      @click="download"
    >
      <!-- With a tooltip inside, the icon must be in the slot or v-btn won't draw it. -->
      <v-icon v-if="xs" :icon="iconDownload" />
      <template v-else>{{ $t('export.download') }}</template>
      <v-tooltip activator="parent" location="top" :open-delay="600">
        {{ $t('export.downloadHint') }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<style scoped>
.result-actions {
  position: absolute;
  inset-block-end: 16px;
  inset-inline-end: 16px;
  z-index: 5; /* above the CodeMirror view */
  display: flex;
  align-items: center;
  gap: 10px;
}
.result-actions__copy {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
</style>
