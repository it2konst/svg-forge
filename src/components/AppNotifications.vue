<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()
</script>

<template>
  <v-snackbar-queue
    v-model="notifications.queue"
    location="bottom center"
    variant="flat"
    rounded="lg"
    closable
    :close-text="$t('notifications.close')"
  />
</template>
