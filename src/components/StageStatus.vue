<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFormatBytes } from '@/composables/useFormatBytes'
import { useDocumentStore } from '@/stores/document'
import { useOptimizerStore } from '@/stores/optimizer'
import { useSettingsStore } from '@/stores/settings'
import { formatChange } from '@/utils/format'

const { t, locale } = useI18n()
const { formatBytes } = useFormatBytes()
const { xs } = useDisplay()
const documentStore = useDocumentStore()
const optimizer = useOptimizerStore()
const settings = useSettingsStore()

const doc = computed(() => documentStore.current)
const result = computed(() => optimizer.result)
const gzip = computed(() => settings.compareGzip)

/** The two sizes being compared: raw bytes, or gzipped bytes in "compare gzipped" mode. */
const originalSize = computed(() => {
  if (!doc.value) return null
  return gzip.value ? optimizer.originalGzipBytes : doc.value.bytes
})
const optimizedSize = computed(() => {
  if (!result.value) return null
  return gzip.value ? result.value.gzipBytes : result.value.bytes
})

/** Size change as a signed percentage: "-71%" saved, "+3%" if SVGO made it bigger. */
const change = computed(() => {
  const before = originalSize.value
  const after = optimizedSize.value
  return before === null || after === null ? null : formatChange(before, after, locale.value)
})

const timeTitle = computed(() =>
  result.value ? t('stats.time', { ms: Math.max(1, Math.round(result.value.ms)) }) : undefined,
)
</script>

<template>
  <footer class="stage-status">
    <span>
      {{ $t('stats.original') }}:
      <strong>{{ originalSize !== null ? formatBytes(originalSize) : '-' }}</strong>
    </span>

    <span :title="timeTitle">
      {{ $t('stats.optimized') }}:
      <strong>{{ optimizedSize !== null ? formatBytes(optimizedSize) : '-' }}</strong>
      <span
        v-if="change"
        class="stage-status__change"
        :class="change.grew ? 'text-warning' : 'text-success'"
      >
        {{ change.text }}
      </span>
    </span>

    <span v-if="gzip" class="stage-status__tag" :title="$t('stats.gzipHint')">gzip</span>

    <span v-if="optimizer.status === 'running'" class="stage-status__running" role="status">
      <v-progress-circular indeterminate size="14" width="2" />
      <span v-if="!xs">{{ $t('optimizer.running') }}</span>
    </span>

    <v-spacer />
    <span v-if="!doc && !xs" class="stage-status__note">{{ $t('stats.noFile') }}</span>
  </footer>
</template>

<style scoped>
.stage-status {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 16px;
  font-size: 0.8125rem;
  white-space: nowrap;
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}
.stage-status strong {
  font-weight: 600;
}
.stage-status__change {
  margin-inline-start: 4px;
  font-weight: 600;
}
.stage-status__tag {
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.6;
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
}
.stage-status__running {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.stage-status__note {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
@media (max-width: 599.98px) {
  .stage-status {
    gap: 12px;
  }
}
</style>
