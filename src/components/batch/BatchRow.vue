<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFormatBytes } from '@/composables/useFormatBytes'
import { useSvgBlobUrl } from '@/composables/useSvgBlobUrl'
import { iconClose, iconDownload, iconEdit, iconError, iconQueued } from '@/icons'
import type { BatchItem } from '@/stores/batch'
import { useSettingsStore } from '@/stores/settings'
import { formatChange } from '@/utils/format'

/** One file in the batch: thumbnail, sizes or status, and its actions. */
const props = defineProps<{ item: BatchItem }>()
defineEmits<{ open: []; download: []; remove: [] }>()

const { t, locale } = useI18n()
const { formatBytes } = useFormatBytes()
const { xs } = useDisplay()
const settings = useSettingsStore()

// The thumbnail shows the result once it exists, the original until then.
const thumbnail = useSvgBlobUrl(() => props.item.result?.markup ?? props.item.markup)

const sizes = computed(() => {
  const { item } = props
  if (!item.result) return null
  const gzip = settings.compareGzip && item.gzipBytes !== null
  const before = gzip ? (item.gzipBytes as number) : item.bytes
  const after = gzip ? item.result.gzipBytes : item.result.bytes
  return { before, after, change: formatChange(before, after, locale.value) }
})

const errorText = computed(() => {
  const code = props.item.error
  if (!code) return ''
  return code === 'timeout' || code === 'failed' ? t(`batch.errors.${code}`) : t(`errors.${code}`)
})
</script>

<template>
  <li class="batch-row" :class="`batch-row--${item.status}`">
    <div class="batch-row__thumb" aria-hidden="true">
      <img v-if="thumbnail && item.markup" :src="thumbnail" alt="" loading="lazy" />
      <v-icon v-else :icon="iconError" color="error" />
    </div>

    <div class="batch-row__main">
      <span class="batch-row__name" :title="item.name">{{ item.name }}</span>

      <span v-if="item.status === 'done' && sizes" class="batch-row__sizes">
        {{ formatBytes(sizes.before) }} → <strong>{{ formatBytes(sizes.after) }}</strong>
        <span
          v-if="sizes.change"
          :class="sizes.change.grew ? 'text-warning' : 'text-success'"
          class="batch-row__change"
        >
          {{ sizes.change.text }}
        </span>
      </span>
      <span v-else-if="item.status === 'running'" class="batch-row__status">
        <v-progress-circular indeterminate size="12" width="2" />
        {{ t('optimizer.running') }}
      </span>
      <span v-else-if="item.status === 'queued'" class="batch-row__status">
        <v-icon :icon="iconQueued" size="14" />
        {{ t('batch.queued') }}
      </span>
      <span v-else class="batch-row__status batch-row__status--error" role="alert">
        {{ errorText }}
      </span>
    </div>

    <div class="batch-row__actions">
      <v-btn
        v-if="item.markup"
        icon
        size="small"
        variant="text"
        :aria-label="t('batch.open', { name: item.name })"
        @click="$emit('open')"
      >
        <v-icon :icon="iconEdit" />
        <v-tooltip activator="parent">{{ t('batch.open', { name: item.name }) }}</v-tooltip>
      </v-btn>
      <v-btn
        v-if="!xs || item.status === 'done'"
        icon
        size="small"
        variant="text"
        :disabled="item.status !== 'done'"
        :aria-label="t('batch.download', { name: item.name })"
        @click="$emit('download')"
      >
        <v-icon :icon="iconDownload" />
        <v-tooltip activator="parent">{{ t('batch.download', { name: item.name }) }}</v-tooltip>
      </v-btn>
      <v-btn
        icon
        size="small"
        variant="text"
        :aria-label="t('batch.remove', { name: item.name })"
        @click="$emit('remove')"
      >
        <v-icon :icon="iconClose" />
        <v-tooltip activator="parent">{{ t('batch.remove', { name: item.name }) }}</v-tooltip>
      </v-btn>
    </div>
  </li>
</template>

<style scoped>
.batch-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.batch-row__thumb {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: repeating-conic-gradient(
      rgb(var(--v-theme-checker-a)) 0 25%,
      rgb(var(--v-theme-checker-b)) 0 50%
    )
    0 0 / 10px 10px;
}
.batch-row__thumb img {
  width: 100%;
  height: 100%;
  padding: 6px;
  object-fit: contain;
}
.batch-row__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.batch-row__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 550;
}
.batch-row__sizes,
.batch-row__status {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.batch-row__sizes strong {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}
.batch-row__change {
  font-weight: 600;
}
.batch-row__status--error {
  color: rgb(var(--v-theme-error));
}
.batch-row__actions {
  display: flex;
  gap: 2px;
}
.batch-row--error .batch-row__thumb {
  background: rgba(var(--v-theme-error), 0.08);
}
@media (max-width: 599.98px) {
  .batch-row {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 10px;
    padding: 8px;
  }
  .batch-row__thumb {
    width: 44px;
    height: 44px;
  }
}
</style>
