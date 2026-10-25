<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useLocaleSync } from '@/composables/useLocaleSync'
import { useThemeSync } from '@/composables/useThemeSync'

useThemeSync()
useLocaleSync()
</script>

<template>
  <v-app>
    <v-app-bar flat border="b" density="comfortable">
      <v-app-bar-title>{{ $t('app.name') }}</v-app-bar-title>
      <template #append>
        <LanguageSwitcher />
        <ThemeSwitcher />
      </template>
    </v-app-bar>
    <v-main />
  </v-app>
</template>
