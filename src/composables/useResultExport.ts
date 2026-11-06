import { computed } from 'vue'
import { createSharedComposable, useEventListener } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useDocumentStore } from '@/stores/document'
import { useNotificationsStore } from '@/stores/notifications'
import { useOptimizerStore } from '@/stores/optimizer'
import { downloadText } from '@/utils/download'

/** Keeps the original name, so the result can replace the file it came from. */
export function downloadName(name: string): string {
  return /\.svg$/i.test(name) ? name : `${name}.svg`
}

/**
 * Download and copy for the optimized SVG, plus the Ctrl+S / ⌘S shortcut.
 * Shared, so the shortcut is registered once however many buttons use it.
 */
export const useResultExport = createSharedComposable(() => {
  const { t } = useI18n()
  const documentStore = useDocumentStore()
  const optimizer = useOptimizerStore()
  const notifications = useNotificationsStore()

  const ready = computed(() => documentStore.current !== null && optimizer.result !== null)

  function download() {
    const doc = documentStore.current
    const result = optimizer.result
    if (!doc || !result) return

    downloadText(result.markup, downloadName(doc.name), 'image/svg+xml')
  }

  async function copy() {
    const result = optimizer.result
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.markup)
      notifications.notify(t('export.copied'), 'success')
    } catch {
      notifications.notify(t('export.copyFailed'), 'error')
    }
  }

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 's') {
      if (!documentStore.current) return // nothing open: leave the browser's own Save alone
      event.preventDefault()
      download()
    }
  })

  return { ready, download, copy }
})
