<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { iconCheck, iconLanguage } from '@/icons'
import { LOCALE_NAMES, SUPPORTED_LOCALES } from '@/i18n'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-btn v-bind="menuProps" :prepend-icon="iconLanguage" :aria-label="t('language.label')">
        {{ settings.locale.toUpperCase() }}
      </v-btn>
    </template>
    <v-list density="compact" min-width="180">
      <v-list-item
        v-for="code in SUPPORTED_LOCALES"
        :key="code"
        :title="LOCALE_NAMES[code]"
        :lang="code"
        :active="settings.locale === code"
        @click="settings.locale = code"
      >
        <template v-if="settings.locale === code" #append>
          <v-icon :icon="iconCheck" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
