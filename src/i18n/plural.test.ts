import { describe, expect, it } from 'vitest'
import { createAppI18n, russianPluralRule } from './index'

describe('russianPluralRule', () => {
  // zero | one | few | many
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [4, 2],
    [5, 3],
    [11, 3],
    [12, 3],
    [14, 3],
    [21, 1],
    [22, 2],
    [25, 3],
    [101, 1],
    [111, 3],
    [112, 3],
  ])('%i -> form %i', (count, form) => {
    expect(russianPluralRule(count, 4)).toBe(form)
  })
})

describe('file count messages', () => {
  it('reads naturally in Russian', () => {
    const { t } = createAppI18n('ru').global
    expect([1, 2, 5, 21, 0].map((n) => t('batch.files', n))).toEqual([
      '1 файл',
      '2 файла',
      '5 файлов',
      '21 файл',
      'Нет файлов',
    ])
  })

  it('reads naturally in English', () => {
    const { t } = createAppI18n('en').global
    expect([1, 2, 0].map((n) => t('batch.files', n))).toEqual(['1 file', '2 files', 'No files'])
  })
})
