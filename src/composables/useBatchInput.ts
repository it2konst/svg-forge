import { useI18n } from 'vue-i18n'
import { useBatchStore } from '@/stores/batch'
import { useNotificationsStore } from '@/stores/notifications'
import { useUiStore } from '@/stores/ui'

/** Adds files to the batch, switches to the batch list and reports what was skipped. */
export function useBatchInput() {
  const { t } = useI18n()
  const batch = useBatchStore()
  const ui = useUiStore()
  const notifications = useNotificationsStore()

  async function addToBatch(files: readonly File[]) {
    const outcome = await batch.addFiles(files)
    if (outcome.added) ui.mode = 'batch'
    if (outcome.skippedNotSvg) {
      notifications.notify(t('batch.skippedNotSvg', { count: outcome.skippedNotSvg }), 'warning')
    }
    if (outcome.skippedOverLimit) {
      notifications.notify(
        t('batch.skippedOverLimit', { count: outcome.skippedOverLimit }),
        'warning',
      )
    }
  }

  /**
   * Where files go: in batch mode, or when several arrive at once, into the batch;
   * a single file otherwise opens in the editor.
   */
  function shouldBatch(fileCount: number): boolean {
    return ui.mode === 'batch' || fileCount > 1
  }

  return { addToBatch, shouldBatch }
}
