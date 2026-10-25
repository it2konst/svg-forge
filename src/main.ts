import { createApp } from 'vue'
import { createPinia } from 'pinia'
import type { I18n } from 'vue-i18n'
import App from './App.vue'
import { createAppI18n } from './i18n'
import { createAppVuetify } from './plugins/vuetify'
import { useSettingsStore } from './stores/settings'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Saved preferences decide the initial language and theme before the first render.
const settings = useSettingsStore(pinia)
const i18n = createAppI18n(settings.locale)
document.documentElement.lang = settings.locale

app.use(i18n)
app.use(createAppVuetify(settings.themeMode, i18n as unknown as I18n))

app.mount('#app')
