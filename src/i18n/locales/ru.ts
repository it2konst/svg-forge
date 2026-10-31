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
  paste: {
    title: 'Вставить код SVG',
    placeholder: '<svg xmlns="http://www.w3.org/2000/svg" …',
    hint: 'Совет: можно просто нажать Ctrl+V в любом месте страницы, чтобы вставить SVG.',
    cancel: 'Отмена',
    submit: 'Открыть',
  },
  drop: {
    release: 'Отпустите, чтобы открыть',
    onlyFirst: 'Открыт первый SVG. Обработка нескольких файлов сразу появится позже.',
  },
  document: {
    close: 'Закрыть файл',
  },
  notifications: {
    close: 'Закрыть',
  },
  errors: {
    empty: 'Пусто. Вставьте код SVG или выберите файл.',
    tooLarge: 'Файл больше 10 МБ — слишком большой для оптимизации в браузере.',
    notSvg: 'Это не SVG. Выберите файл с расширением .svg или вставьте код с тегом <svg>.',
    invalidXml:
      'В коде SVG ошибка, и его не получается прочитать. Проверьте, что все теги закрыты.',
    readFailed: 'Не удалось прочитать файл. Попробуйте открыть его ещё раз.',
  },
  units: {
    b: 'Б',
    kb: 'КБ',
    mb: 'МБ',
  },
  stats: {
    original: 'Исходный',
    optimized: 'Оптимизированный',
    noFile: 'Файл пока не выбран',
  },
}

export default ru
