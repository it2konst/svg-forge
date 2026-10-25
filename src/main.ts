import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createAppVuetify } from './plugins/vuetify'
import { useSettingsStore } from './stores/settings'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const settings = useSettingsStore(pinia)
app.use(createAppVuetify(settings.themeMode))

app.mount('#app')
