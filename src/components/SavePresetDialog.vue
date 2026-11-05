<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications'
import { PRESET_NAME_MAX, usePresetsStore } from '@/stores/presets'

/** Asks for a name and saves the current settings as a preset. */
const open = defineModel<boolean>({ required: true })

const { t } = useI18n()
const presets = usePresetsStore()
const notifications = useNotificationsStore()

const name = ref('')
const touched = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = ''
    touched.value = false
  }
})

const trimmed = computed(() => name.value.trim())
const error = computed(() =>
  touched.value && !trimmed.value ? t('presets.dialog.nameRequired') : undefined,
)
const willUpdate = computed(() => trimmed.value !== '' && presets.findByName(trimmed.value))

function save() {
  touched.value = true
  if (!trimmed.value) return
  const outcome = presets.saveCurrent(trimmed.value)
  notifications.notify(t(`presets.${outcome}`, { name: trimmed.value }), 'success')
  open.value = false
}
</script>

<template>
  <v-dialog v-model="open" max-width="420">
    <v-card :title="t('presets.dialog.title')" rounded="xl">
      <v-card-text>
        <v-text-field
          v-model="name"
          :label="t('presets.dialog.name')"
          :counter="PRESET_NAME_MAX"
          :maxlength="PRESET_NAME_MAX"
          :error-messages="error"
          :hint="willUpdate ? t('presets.dialog.overwrite') : undefined"
          persistent-hint
          variant="outlined"
          autofocus
          autocomplete="off"
          @blur="touched = true"
          @keydown.enter.prevent="save"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="open = false">{{ t('presets.dialog.cancel') }}</v-btn>
        <v-btn variant="flat" color="primary" @click="save">
          {{ willUpdate ? t('presets.dialog.update') : t('presets.dialog.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
