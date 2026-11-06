<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFormatBytes } from '@/composables/useFormatBytes'
import { iconCopy, iconDownload } from '@/icons'
import { useNotificationsStore } from '@/stores/notifications'
import { downloadText } from '@/utils/download'
import { byteLength } from '@/utils/svg'

/** Generated code with its size, a Copy button and an optional Download button. */
const props = defineProps<{
  code: string
  label: string
  /** When set, a Download button saves the code under this name. */
  fileName?: string
  mimeType?: string
}>()

const { t } = useI18n()
const { formatBytes } = useFormatBytes()
const notifications = useNotificationsStore()
const { xs } = useDisplay()

const size = computed(() => formatBytes(byteLength(props.code)))

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    notifications.notify(t('exportCode.copied'), 'success')
  } catch {
    notifications.notify(t('exportCode.copyFailed'), 'error')
  }
}

function download() {
  if (props.fileName) downloadText(props.code, props.fileName, props.mimeType ?? 'text/plain')
}
</script>

<template>
  <div class="code-output">
    <pre class="code-output__code" tabindex="0" :aria-label="label"><code>{{ code }}</code></pre>
    <div class="code-output__bar">
      <span class="code-output__size">{{ size }}</span>
      <v-spacer />
      <!-- On phones the file name would push Copy onto its own line. -->
      <v-btn
        v-if="fileName"
        :prepend-icon="xs ? undefined : iconDownload"
        :icon="xs"
        :aria-label="t('exportCode.downloadFile', { name: fileName })"
        variant="tonal"
        @click="download"
      >
        <v-icon v-if="xs" :icon="iconDownload" />
        <template v-else>{{ fileName }}</template>
      </v-btn>
      <v-btn :prepend-icon="iconCopy" variant="flat" color="primary" @click="copy">
        {{ t('exportCode.copy') }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.code-output__code {
  max-height: min(46vh, 420px);
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  border-radius: 10px;
  font-family: var(--app-font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: rgb(var(--v-theme-surface-light));
  color: rgb(var(--v-theme-on-surface));
}
.code-output__code:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.code-output__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
.code-output__size {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
