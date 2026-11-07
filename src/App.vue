<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import AppHeader from '@/components/AppHeader.vue'
import AppNotifications from '@/components/AppNotifications.vue'
import DropOverlay from '@/components/DropOverlay.vue'
import ExportDialog from '@/components/export/ExportDialog.vue'
import PasteDialog from '@/components/PasteDialog.vue'
import PreviewStage from '@/components/PreviewStage.vue'
import BatchView from '@/components/batch/BatchView.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { useLocaleSync } from '@/composables/useLocaleSync'
import { useOptimizerErrors } from '@/composables/useOptimizerErrors'
import { usePasteListener } from '@/composables/usePasteListener'
import { useThemeSync } from '@/composables/useThemeSync'
import { useBatchStore } from '@/stores/batch'
import { useUiStore } from '@/stores/ui'

useThemeSync()
useLocaleSync()
usePasteListener()
useOptimizerErrors()

const ui = useUiStore()
const batch = useBatchStore()
const { lgAndUp } = useDisplay()

// Wide screens: settings sit beside the preview. Narrow screens: they slide over it.
const settingsOpen = computed({
  get: () => ui.settingsOpen ?? lgAndUp.value,
  set: (value: boolean) => (ui.settingsOpen = value),
})
</script>

<template>
  <v-app>
    <AppHeader @toggle-settings="settingsOpen = !settingsOpen" />

    <v-navigation-drawer
      v-model="settingsOpen"
      location="end"
      width="320"
      :temporary="!lgAndUp"
      color="surface"
    >
      <SettingsPanel />
    </v-navigation-drawer>

    <v-main class="app-main">
      <BatchView v-if="ui.mode === 'batch' && batch.hasItems" />
      <PreviewStage v-else />
    </v-main>

    <PasteDialog />
    <ExportDialog />
    <DropOverlay />
    <AppNotifications />
  </v-app>
</template>

<style scoped>
.app-main {
  height: 100dvh;
}
</style>
