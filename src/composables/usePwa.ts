import { computed, ref, watch } from 'vue'
import { createSharedComposable, useEventListener, useMediaQuery } from '@vueuse/core'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications'

/** The browser's install prompt event; not in TypeScript's DOM types yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Service worker registration, "new version" prompt and the install button.
 * Shared, so the worker is registered once however many components ask.
 */
export const usePwa = createSharedComposable(() => {
  const { t } = useI18n()
  const notifications = useNotificationsStore()

  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisterError: (error) => console.warn('Service worker registration failed:', error),
  })

  // Said once, the first time everything is cached.
  watch(offlineReady, (ready) => {
    if (ready) notifications.notify(t('pwa.offlineReady'), 'success')
  })

  function update() {
    void updateServiceWorker(true)
  }

  function dismissUpdate() {
    needRefresh.value = false
  }

  // Install: the browser fires beforeinstallprompt when the app can be installed.
  // Keeping the event lets us show our own button instead of the browser's banner.
  const installEvent = ref<BeforeInstallPromptEvent | null>(null)
  const runningInstalled = useMediaQuery('(display-mode: standalone)')

  useEventListener(window, 'beforeinstallprompt', (event: Event) => {
    event.preventDefault()
    installEvent.value = event as BeforeInstallPromptEvent
  })
  useEventListener(window, 'appinstalled', () => {
    installEvent.value = null
    notifications.notify(t('pwa.installed'), 'success')
  })

  const canInstall = computed(() => installEvent.value !== null && !runningInstalled.value)

  async function install() {
    const event = installEvent.value
    if (!event) return
    await event.prompt()
    // The event can be used only once, whatever the answer.
    installEvent.value = null
  }

  return { needRefresh, update, dismissUpdate, canInstall, install }
})
