<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import ExportCss from '@/components/export/ExportCss.vue'
import ExportDataUri from '@/components/export/ExportDataUri.vue'
import ExportVue from '@/components/export/ExportVue.vue'
import { iconClose } from '@/icons'
import { useDocumentStore } from '@/stores/document'
import { useOptimizerStore } from '@/stores/optimizer'
import { useUiStore } from '@/stores/ui'

/** The optimized SVG as ready-to-paste code. */
const { t } = useI18n()
const ui = useUiStore()
const optimizer = useOptimizerStore()
const documentStore = useDocumentStore()
const { xs } = useDisplay()

type ExportTab = 'vue' | 'css' | 'uri'
const tab = ref<ExportTab>('vue')
const tabs: ExportTab[] = ['vue', 'css', 'uri']

// A tab is built the first time it is opened and kept afterwards, so a big file
// doesn't compute data URIs nobody asked for, and edited fields survive switching.
const visited = reactive(new Set<ExportTab>(['vue']))
watch(tab, (name) => visited.add(name))
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

      <!-- Plain v-show panels instead of v-window: no slide animation is needed here,
           and v-window adds a non-passive wheel listener and clips its content
           (it cut off the edge of the switch thumbs). -->
      <v-card-text v-if="optimizer.result && documentStore.current" class="pt-4">
        <div
          v-if="visited.has('vue')"
          v-show="tab === 'vue'"
          role="tabpanel"
          :aria-label="t('exportCode.tabs.vue')"
        >
          <ExportVue :markup="optimizer.result.markup" :file-name="documentStore.current.name" />
        </div>
        <div
          v-if="visited.has('css')"
          v-show="tab === 'css'"
          role="tabpanel"
          :aria-label="t('exportCode.tabs.css')"
        >
          <ExportCss :markup="optimizer.result.markup" :file-name="documentStore.current.name" />
        </div>
        <div
          v-if="visited.has('uri')"
          v-show="tab === 'uri'"
          role="tabpanel"
          :aria-label="t('exportCode.tabs.uri')"
        >
          <ExportDataUri :markup="optimizer.result.markup" />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
