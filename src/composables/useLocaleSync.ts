import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

/** Applies the saved language to vue-i18n (and thus Vuetify) and to <html lang>. */
export function useLocaleSync() {
  const { locale } = useI18n({ useScope: 'global' })
  const settings = useSettingsStore()

  watch(
    () => settings.locale,
    (value) => {
      locale.value = value
      document.documentElement.lang = value
    },
  )
}
