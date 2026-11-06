<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CodeOutput from '@/components/export/CodeOutput.vue'
import { useFormatBytes } from '@/composables/useFormatBytes'
import { type DataUriEncoding, toDataUri } from '@/export/dataUri'
import { byteLength } from '@/utils/svg'

const props = defineProps<{ markup: string }>()

const { t } = useI18n()
const { formatBytes } = useFormatBytes()

const encoding = ref<DataUriEncoding>('url')
const encodings: DataUriEncoding[] = ['url', 'base64']

const uris = computed(() => ({
  url: toDataUri(props.markup, 'url'),
  base64: toDataUri(props.markup, 'base64'),
}))
</script>

<template>
  <div class="export-tab">
    <p class="export-tab__intro">{{ t('exportCode.uri.intro') }}</p>

    <v-btn-toggle
      v-model="encoding"
      mandatory
      density="compact"
      rounded="lg"
      variant="outlined"
      divided
      :aria-label="t('exportCode.uri.encoding')"
      class="mb-3"
    >
      <v-btn v-for="option in encodings" :key="option" :value="option" size="small">
        {{ t(`exportCode.uri.${option}`) }}
        <span class="export-tab__size">{{ formatBytes(byteLength(uris[option])) }}</span>
      </v-btn>
    </v-btn-toggle>

    <CodeOutput :code="uris[encoding]" :label="t('exportCode.tabs.uri')" />
  </div>
</template>

<style scoped>
.export-tab__intro {
  margin: 0 0 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.export-tab__size {
  margin-inline-start: 6px;
  font-weight: 400;
  opacity: 0.7;
}
</style>
