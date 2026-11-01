import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications'
import { useOptimizerStore } from '@/stores/optimizer'

/** Shows a snackbar whenever an optimization run fails. */
export function useOptimizerErrors() {
  const { t } = useI18n()
  const optimizer = useOptimizerStore()
  const notifications = useNotificationsStore()

  watch(
    () => optimizer.error?.id,
    () => {
      const error = optimizer.error
      if (!error) return
      if (error.code === 'failed') console.error('SVGO failed:', error.detail)
      notifications.notify(t(`optimizer.errors.${error.code}`), 'error')
    },
  )
}
