<script setup lang="ts">
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useThemeSync } from '@/composables/useThemeSync'

useThemeSync()
</script>

<template>
  <v-app>
    <v-app-bar flat border="b" density="comfortable">
      <v-app-bar-title>svg-forge</v-app-bar-title>
      <template #append>
        <ThemeSwitcher />
      </template>
    </v-app-bar>
    <v-main />
  </v-app>
</template>
