<script setup lang="ts">
import { usePwa } from '@/composables/usePwa'

/** Stays until the user decides: a reload must never surprise someone mid-work. */
const { needRefresh, update, dismissUpdate } = usePwa()
</script>

<template>
  <v-snackbar
    :model-value="needRefresh"
    :timeout="-1"
    location="bottom end"
    rounded="lg"
    multi-line
    @update:model-value="(open: boolean) => !open && dismissUpdate()"
  >
    {{ $t('pwa.updateAvailable') }}
    <template #actions>
      <v-btn variant="text" @click="dismissUpdate">{{ $t('pwa.later') }}</v-btn>
      <v-btn variant="flat" color="primary" @click="update">{{ $t('pwa.update') }}</v-btn>
    </template>
  </v-snackbar>
</template>
