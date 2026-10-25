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
  actions: {
    open: 'Открыть SVG',
    paste: 'Вставить код',
    demo: 'Пример',
    settings: 'Настройки',
  },
  view: {
    label: 'Вид',
    image: 'Изображение',
    markup: 'Код',
  },
  previewBg: {
    label: 'Фон превью',
    checkerboard: 'Шахматный',
    light: 'Светлый',
    dark: 'Тёмный',
  },
  empty: {
    title: 'Перетащите SVG сюда',
    hint: 'Или откройте файл, вставьте код, или посмотрите пример. Файлы не покидают браузер.',
  },
  settings: {
    title: 'Настройки',
    global: 'Общие',
    optimizations: 'Оптимизации',
    pending: 'Параметры оптимизации появятся здесь, когда подключим SVGO.',
  },
  stats: {
    original: 'Исходный',
    optimized: 'Оптимизированный',
    noFile: 'Файл пока не выбран',
  },
}

export default ru
