<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CodeOutput from '@/components/export/CodeOutput.vue'
import { geometrySize } from '@/export/defaults'
import { baseName, isValidComponentName, toPascalCase } from '@/export/names'
import { toVueComponent } from '@/export/vue'

const props = defineProps<{ markup: string; fileName: string }>()

const { t } = useI18n()

const name = ref('')
const defaultSize = ref('')
const currentColor = ref(false)

// New file: suggest a name and a size from it.
watch(
  () => props.fileName,
  (fileName) => {
    name.value = toPascalCase(baseName(fileName))
    defaultSize.value = geometrySize(props.markup)
  },
  { immediate: true },
)

const nameValid = computed(() => isValidComponentName(name.value))
const sizeValid = computed(() => defaultSize.value.trim() !== '')

const result = computed(() =>
  toVueComponent(props.markup, {
    name: name.value,
    defaultSize: defaultSize.value,
    currentColor: currentColor.value,
    sourceName: props.fileName,
  }),
)
</script>

<template>
  <div class="export-tab">
    <p class="export-tab__intro">{{ t('exportCode.vue.intro') }}</p>

    <div class="export-tab__options">
      <v-text-field
        v-model.trim="name"
        :label="t('exportCode.vue.name')"
        :error-messages="nameValid ? undefined : t('exportCode.vue.invalidName')"
        suffix=".vue"
        density="compact"
        variant="outlined"
        spellcheck="false"
        autocomplete="off"
        class="export-tab__field"
      />
      <v-text-field
        v-model="defaultSize"
        :label="t('exportCode.vue.size')"
        :hint="t('exportCode.vue.sizeHint')"
        :error-messages="sizeValid ? undefined : t('exportCode.vue.sizeRequired')"
        density="compact"
        variant="outlined"
        spellcheck="false"
        autocomplete="off"
        class="export-tab__field export-tab__field--narrow"
      />
    </div>

    <v-switch
      v-model="currentColor"
      :label="t('exportCode.vue.currentColor')"
      color="primary"
      density="compact"
      hide-details
    />
    <p v-if="currentColor && result.colorCount > 1" class="export-tab__warning" role="status">
      {{ t('exportCode.vue.manyColors', { count: result.colorCount }) }}
    </p>

    <CodeOutput
      v-if="nameValid && sizeValid"
      class="mt-3"
      :code="result.code"
      :label="t('exportCode.tabs.vue')"
      :file-name="`${name}.vue`"
      mime-type="text/plain"
    />
  </div>
</template>

<style scoped>
.export-tab__intro {
  margin: 0 0 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.export-tab__options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.export-tab__field {
  flex: 1 1 220px;
  max-width: 320px;
}
.export-tab__field--narrow {
  flex: 0 1 180px;
}
.export-tab__warning {
  margin: 4px 0 0;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-warning));
}
</style>
