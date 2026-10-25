import { ru as vuetifyRu } from 'vuetify/locale'
import type { MessageSchema } from './en'

const ru: MessageSchema = {
  $vuetify: vuetifyRu,
  app: {
    name: 'svg-forge',
  },
  theme: {
    label: 'Тема',
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Как в системе',
  },
  language: {
    label: 'Язык',
  },
}

export default ru
