import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications'
import { SvgInputError } from '@/utils/svg'

/** Turns any loading error into a translated, actionable snackbar message. */
export function useSvgErrors() {
  const { t } = useI18n()
  const notifications = useNotificationsStore()

  function reportError(error: unknown) {
    if (error instanceof SvgInputError) {
      notifications.notify(t(`errors.${error.code}`), 'error')
      return
    }
    console.error(error)
    notifications.notify(t('errors.readFailed'), 'error')
  }

  return { reportError }
}
