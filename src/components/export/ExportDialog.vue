<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import ExportDataUri from '@/components/export/ExportDataUri.vue'
import { iconClose } from '@/icons'
import { useOptimizerStore } from '@/stores/optimizer'
import { useUiStore } from '@/stores/ui'

/** The optimized SVG as ready-to-paste code. */
const { t } = useI18n()
const ui = useUiStore()
const optimizer = useOptimizerStore()
const { xs } = useDisplay()

type ExportTab = 'uri'
const tab = ref<ExportTab>('uri')
const tabs: ExportTab[] = ['uri']
</script>

<template>
  <v-dialog v-model="ui.exportDialogOpen" max-width="820" :fullscreen="xs" scrollable>
    <!-- Own Escape handling: while a "Copied" snackbar is on screen, Vuetify treats
         it as the top overlay and the dialog would ignore Escape until it fades. -->
    <v-card rounded="xl" @keydown.esc.stop="ui.exportDialogOpen = false">
      <v-card-title class="d-flex align-center">
        <span>{{ t('exportCode.title') }}</span>
        <v-spacer />
        <v-btn
          icon
          size="small"
          :aria-label="t('exportCode.close')"
          @click="ui.exportDialogOpen = false"
        >
          <v-icon :icon="iconClose" />
        </v-btn>
      </v-card-title>

      <v-tabs v-model="tab" color="primary" class="px-4">
        <v-tab v-for="name in tabs" :key="name" :value="name">{{
          t(`exportCode.tabs.${name}`)
        }}</v-tab>
      </v-tabs>
      <v-divider />

      <v-card-text v-if="optimizer.result" class="pt-4">
        <v-window v-model="tab">
          <v-window-item value="uri">
            <ExportDataUri :markup="optimizer.result.markup" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
