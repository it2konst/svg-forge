import { describe, expect, it } from 'vitest'
import {
  baseName,
  isValidClassName,
  isValidComponentName,
  toKebabCase,
  toPascalCase,
} from './names'

describe('baseName', () => {
  it('drops folders and the .svg extension', () => {
    expect(baseName('icons/Arrow Left.svg')).toBe('Arrow Left')
    expect(baseName('C:\\art\\logo.SVG')).toBe('logo')
    expect(baseName('pasted')).toBe('pasted')
  })
})

describe('toPascalCase', () => {
  it.each([
    ['evening-hills', 'EveningHills'],
    ['Arrow Left', 'ArrowLeft'],
    ['icon_close_24', 'IconClose24'],
    ['alreadyCamel', 'AlreadyCamel'],
  ])('%s -> %s', (input, expected) => {
    expect(toPascalCase(input)).toBe(expected)
  })

  it('never starts with a digit', () => {
    expect(toPascalCase('24px-icon')).toBe('Svg24pxIcon')
  })

  it('falls back when nothing Latin is left', () => {
    expect(toPascalCase('иконка')).toBe('SvgIcon')
    expect(toPascalCase('---')).toBe('SvgIcon')
  })

  it('always produces a valid component name', () => {
    for (const input of ['a', '9', 'ёлка', 'x-y-z', 'ABC def']) {
      expect(isValidComponentName(toPascalCase(input)), input).toBe(true)
    }
  })
})

describe('toKebabCase', () => {
  it.each([
    ['EveningHills', 'evening-hills'],
    ['Arrow Left', 'arrow-left'],
    ['icon_close_24', 'icon-close-24'],
  ])('%s -> %s', (input, expected) => {
    expect(toKebabCase(input)).toBe(expected)
  })

  it('never starts with a digit', () => {
    expect(toKebabCase('24 px')).toBe('svg-24-px')
  })

  it('falls back when nothing Latin is left', () => {
    expect(toKebabCase('ёлка')).toBe('svg-icon')
  })

  it('always produces a valid class name', () => {
    for (const input of ['a', '9', 'ёлка', 'x y z', 'ABC']) {
      expect(isValidClassName(toKebabCase(input)), input).toBe(true)
    }
  })
})

describe('validators', () => {
  it('accept and reject component names', () => {
    expect(isValidComponentName('EveningHills')).toBe(true)
    expect(isValidComponentName('eveningHills')).toBe(false)
    expect(isValidComponentName('Evening-Hills')).toBe(false)
  })

  it('accept and reject class names', () => {
    expect(isValidClassName('icon-close_2')).toBe(true)
    expect(isValidClassName('9icon')).toBe(false)
    expect(isValidClassName('bad name')).toBe(false)
  })
})
