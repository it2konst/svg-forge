<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { iconCheck, iconChevronDown, iconPreset } from '@/icons'
import { BUILTIN_PRESETS } from '@/optimizer/presets'
import { usePresetsStore } from '@/stores/presets'

/** A menu of ready-made settings. Shows "Custom settings" when nothing matches. */
const { t } = useI18n()
const presets = usePresetsStore()

const activeName = computed(() => {
  const active = presets.active
  if (!active) return t('presets.custom')
  return t(`presets.builtins.${active.id}.name`)
})

const isActive = (id: string) => presets.active?.kind === 'builtin' && presets.active.id === id
</script>

<template>
  <v-menu location="bottom start" max-width="320">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="outlined"
        rounded="lg"
        block
        class="preset-picker"
        :aria-label="`${t('presets.label')}: ${activeName}`"
      >
        <v-icon :icon="iconPreset" start />
        <span class="preset-picker__text">
          <span class="preset-picker__label">{{ t('presets.label') }}</span>
          <span class="preset-picker__name">{{ activeName }}</span>
        </span>
        <v-icon :icon="iconChevronDown" end />
      </v-btn>
    </template>

    <v-list density="compact" class="preset-picker__list">
      <v-list-subheader>{{ t('presets.builtIn') }}</v-list-subheader>
      <v-list-item
        v-for="preset in BUILTIN_PRESETS"
        :key="preset.id"
        :title="t(`presets.builtins.${preset.id}.name`)"
        :subtitle="t(`presets.builtins.${preset.id}.description`)"
        :active="isActive(preset.id)"
        lines="two"
        @click="presets.applyBuiltin(preset.id)"
      >
        <template v-if="isActive(preset.id)" #append>
          <v-icon :icon="iconCheck" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.preset-picker {
  height: auto !important;
  min-height: 48px;
  padding-block: 6px;
  justify-content: flex-start;
  text-transform: none;
  border-color: rgba(var(--v-border-color), 0.24);
}
.preset-picker :deep(.v-btn__content) {
  width: 100%;
  justify-content: flex-start;
}
.preset-picker__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  line-height: 1.25;
}
.preset-picker__label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.preset-picker__name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
}
.preset-picker__list :deep(.v-list-item-subtitle) {
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
