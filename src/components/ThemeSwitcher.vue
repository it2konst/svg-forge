<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { iconCheck, iconThemeDark, iconThemeLight, iconThemeSystem } from '@/icons'
import { type ThemeMode, useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

const options: { value: ThemeMode; icon: string }[] = [
  { value: 'light', icon: iconThemeLight },
  { value: 'dark', icon: iconThemeDark },
  { value: 'system', icon: iconThemeSystem },
]

const currentIcon = computed(
  () => options.find((o) => o.value === settings.themeMode)?.icon ?? iconThemeSystem,
)
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-btn v-bind="menuProps" :icon="currentIcon" :aria-label="t('theme.label')" />
    </template>
    <v-list density="compact" min-width="180">
      <v-list-item
        v-for="option in options"
        :key="option.value"
        :prepend-icon="option.icon"
        :title="t(`theme.${option.value}`)"
        :active="settings.themeMode === option.value"
        @click="settings.themeMode = option.value"
      >
        <template v-if="settings.themeMode === option.value" #append>
          <v-icon :icon="iconCheck" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
