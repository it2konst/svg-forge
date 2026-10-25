import { watch } from 'vue'
import { useTheme } from 'vuetify'
import { useSettingsStore } from '@/stores/settings'

/**
 * Keeps Vuetify's active theme in sync with the saved preference.
 * 'system' is handled by Vuetify itself: it follows prefers-color-scheme live.
 */
export function useThemeSync() {
  const theme = useTheme()
  const settings = useSettingsStore()

  watch(
    () => settings.themeMode,
    (mode) => void theme.change(mode),
  )

  // Native form controls and scrollbars follow the active theme too.
  watch(
    () => theme.current.value.dark,
    (dark) => {
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    },
    { immediate: true },
  )
}
