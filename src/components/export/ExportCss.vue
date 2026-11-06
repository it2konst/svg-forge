<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CodeOutput from '@/components/export/CodeOutput.vue'
import { type CssMode, toCss } from '@/export/css'
import { baseName, isValidClassName, toKebabCase } from '@/export/names'

const props = defineProps<{ markup: string; fileName: string }>()

const { t } = useI18n()

const className = ref(toKebabCase(baseName(props.fileName)))
watch(
  () => props.fileName,
  (name) => (className.value = toKebabCase(baseName(name))),
)

const mode = ref<CssMode>('background')
const modes: CssMode[] = ['background', 'mask']

const valid = computed(() => isValidClassName(className.value))
const code = computed(() =>
  valid.value
    ? toCss(props.markup, {
        className: className.value,
        mode: mode.value,
        sourceName: props.fileName,
      })
    : '',
)
</script>

<template>
  <div class="export-tab">
    <p class="export-tab__intro">{{ t(`exportCode.css.intro.${mode}`) }}</p>

    <div class="export-tab__options">
      <v-text-field
        v-model.trim="className"
        :label="t('exportCode.css.className')"
        :error-messages="valid ? undefined : t('exportCode.css.invalidClass')"
        prefix="."
        density="compact"
        variant="outlined"
        spellcheck="false"
        autocomplete="off"
        class="export-tab__name"
      />
      <v-btn-toggle
        v-model="mode"
        mandatory
        density="compact"
        rounded="lg"
        variant="outlined"
        divided
        :aria-label="t('exportCode.css.mode')"
      >
        <v-btn v-for="option in modes" :key="option" :value="option" size="small">
          {{ t(`exportCode.css.modes.${option}`) }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <CodeOutput
      v-if="valid"
      :code="code"
      :label="t('exportCode.tabs.css')"
      :file-name="`${className}.css`"
      mime-type="text/css"
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
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}
.export-tab__name {
  flex: 1 1 220px;
  max-width: 320px;
}
</style>
