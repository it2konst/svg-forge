import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications'
import { SvgInputError } from '@/utils/svg'

/** Turns any loading error into a translated, actionable message. */
export function useSvgErrors() {
  const { t } = useI18n()
  const notifications = useNotificationsStore()

  function messageFor(error: unknown): string {
    if (error instanceof SvgInputError) return t(`errors.${error.code}`)
    console.error(error)
    return t('errors.readFailed')
  }

  /** Shows the message in a snackbar. */
  function reportError(error: unknown) {
    notifications.notify(messageFor(error), 'error')
  }

  return { messageFor, reportError }
}
