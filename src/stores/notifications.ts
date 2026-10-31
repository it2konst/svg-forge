import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationKind = 'success' | 'info' | 'warning' | 'error'

/** The subset of VSnackbarQueue item props we use. */
interface NotificationItem {
  text: string
  color: NotificationKind
  timeout: number
}

/**
 * Short messages shown in a snackbar queue (Vuetify's VSnackbarQueue).
 * Callers pass already translated text: the store knows nothing about i18n.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  // VSnackbarQueue takes items from this array as it shows them.
  const queue = ref<NotificationItem[]>([])

  function notify(text: string, kind: NotificationKind = 'info') {
    queue.value.push({
      text,
      color: kind,
      // Errors stay longer: people need time to read what went wrong.
      timeout: kind === 'error' ? 7000 : 3500,
    })
  }

  return { queue, notify }
})
