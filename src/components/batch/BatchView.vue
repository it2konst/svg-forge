<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import BatchRow from '@/components/batch/BatchRow.vue'
import { useFileOpener } from '@/composables/useFileOpener'
import { useFormatBytes } from '@/composables/useFormatBytes'
import { downloadName } from '@/composables/useResultExport'
import { zipTextFiles } from '@/export/zip'
import { iconAdd, iconClearAll, iconZip } from '@/icons'
import { type BatchItem, useBatchStore } from '@/stores/batch'
import { useDocumentStore } from '@/stores/document'
import { useNotificationsStore } from '@/stores/notifications'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'
import { downloadBlob, downloadText } from '@/utils/download'
import { formatChange } from '@/utils/format'

/** The batch list: totals, bulk actions and one row per file. */
const { t, locale } = useI18n()
const { formatBytes } = useFormatBytes()
const { xs } = useDisplay()
const batch = useBatchStore()
const documentStore = useDocumentStore()
const ui = useUiStore()
const settings = useSettingsStore()
const notifications = useNotificationsStore()
const { openFile } = useFileOpener()

const summary = computed(() => {
  const totals = batch.totals
  const gzip = settings.compareGzip
  const before = gzip ? totals.originalGzipBytes : totals.originalBytes
  const after = gzip ? totals.optimizedGzipBytes : totals.optimizedBytes
  return { before, after, change: formatChange(before, after, locale.value), gzip }
})

function open(item: BatchItem) {
  if (!item.markup) return
  documentStore.load(item.markup, item.name, 'file')
  ui.mode = 'single'
}

function download(item: BatchItem) {
  if (item.result) downloadText(item.result.markup, downloadName(item.name), 'image/svg+xml')
}

function downloadZip() {
  const files = batch.done.flatMap((item) =>
    item.result ? [{ name: downloadName(item.name), text: item.result.markup }] : [],
  )
  if (!files.length) return
  const zip = zipTextFiles(files)
  downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), 'svg-forge.zip')
  if (batch.failed) notifications.notify(t('batch.zipSkipped', { count: batch.failed }), 'info')
}

function clear() {
  batch.clear()
  ui.mode = 'single'
}
</script>

<template>
  <section class="batch" :aria-label="t('batch.title')">
    <header class="batch__header">
      <div class="batch__summary">
        <h1 class="batch__title">{{ t('batch.files', batch.totals.files) }}</h1>
        <p class="batch__totals" role="status">
          <template v-if="batch.running">
            <v-progress-circular indeterminate size="14" width="2" />
            {{ t('batch.progress', { done: batch.totals.done, total: batch.totals.files }) }}
          </template>
          <template v-else-if="summary.change">
            {{ formatBytes(summary.before) }} → <strong>{{ formatBytes(summary.after) }}</strong>
            <span
              :class="summary.change.grew ? 'text-warning' : 'text-success'"
              class="font-weight-bold"
            >
              {{ summary.change.text }}
            </span>
            <span v-if="summary.gzip" class="batch__tag">gzip</span>
          </template>
          <span v-if="batch.failed" class="text-error">
            {{ t('batch.failedCount', { count: batch.failed }) }}
          </span>
        </p>
      </div>

      <div class="batch__actions">
        <v-btn
          :prepend-icon="xs ? undefined : iconAdd"
          :icon="xs"
          :aria-label="t('batch.add')"
          @click="openFile"
        >
          <v-icon v-if="xs" :icon="iconAdd" />
          <template v-else>{{ t('batch.add') }}</template>
        </v-btn>
        <v-btn
          :prepend-icon="xs ? undefined : iconClearAll"
          :icon="xs"
          :aria-label="t('batch.clear')"
          @click="clear"
        >
          <v-icon v-if="xs" :icon="iconClearAll" />
          <template v-else>{{ t('batch.clear') }}</template>
        </v-btn>
        <v-btn
          :prepend-icon="iconZip"
          :disabled="!batch.done.length"
          :loading="batch.running"
          variant="flat"
          color="primary"
          @click="downloadZip"
        >
          {{ t('batch.downloadZip') }}
        </v-btn>
      </div>
    </header>

    <ul class="batch__list">
      <BatchRow
        v-for="item in batch.items"
        :key="item.id"
        :item="item"
        @open="open(item)"
        @download="download(item)"
        @remove="batch.remove(item.id)"
      />
    </ul>
  </section>
</template>

<style scoped>
.batch {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.batch__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}
.batch__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 650;
}
.batch__totals {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 2px 0 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.batch__totals strong {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 650;
}
.batch__tag {
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.6;
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
}
.batch__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.batch__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
