<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useSvgLoader } from '@/composables/useSvgLoader'
import { PASTED_FILE_NAME } from '@/composables/usePasteListener'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const { tryLoadText } = useSvgLoader()
const { xs } = useDisplay()

const markup = ref('')
const error = ref<string | null>(null)

// Start clean every time the dialog opens.
watch(
  () => ui.pasteDialogOpen,
  (open) => {
    if (open) {
      markup.value = ''
      error.value = null
    }
  },
)

watch(markup, () => (error.value = null))

function submit() {
  error.value = tryLoadText(markup.value, PASTED_FILE_NAME, 'paste')
  if (!error.value) ui.pasteDialogOpen = false
}
</script>

<template>
  <v-dialog v-model="ui.pasteDialogOpen" max-width="720" :fullscreen="xs">
    <v-card :title="$t('paste.title')" rounded="xl">
      <v-card-text>
        <v-textarea
          v-model="markup"
          class="paste-dialog__input"
          :placeholder="$t('paste.placeholder')"
          :error-messages="error ?? undefined"
          :aria-label="$t('paste.title')"
          variant="outlined"
          rows="12"
          no-resize
          autofocus
          spellcheck="false"
          autocomplete="off"
          @keydown.enter.ctrl.prevent="submit"
          @keydown.enter.meta.prevent="submit"
        />
        <p class="paste-dialog__hint">{{ $t('paste.hint') }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="ui.pasteDialogOpen = false">{{ $t('paste.cancel') }}</v-btn>
        <v-btn variant="flat" color="primary" :disabled="!markup.trim()" @click="submit">
          {{ $t('paste.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.paste-dialog__input :deep(textarea) {
  font-family: var(--app-font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
}
.paste-dialog__hint {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
