<script setup lang="ts">
import { computed } from 'vue'
import { iconCheck, iconThemeDark, iconThemeLight, iconThemeSystem } from '@/icons'
import { type ThemeMode, useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const options: { value: ThemeMode; title: string; icon: string }[] = [
  { value: 'light', title: 'Light', icon: iconThemeLight },
  { value: 'dark', title: 'Dark', icon: iconThemeDark },
  { value: 'system', title: 'System', icon: iconThemeSystem },
]

const currentIcon = computed(
  () => options.find((o) => o.value === settings.themeMode)?.icon ?? iconThemeSystem,
)
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-btn v-bind="menuProps" :icon="currentIcon" aria-label="Theme" />
    </template>
    <v-list density="compact" min-width="180">
      <v-list-item
        v-for="option in options"
        :key="option.value"
        :prepend-icon="option.icon"
        :title="option.title"
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
