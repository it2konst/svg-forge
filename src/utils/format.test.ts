import { describe, expect, it } from 'vitest'
import { formatChange, splitBytes } from './format'

describe('splitBytes', () => {
  it('keeps small sizes in bytes', () => {
    expect(splitBytes(0, 'en')).toEqual({ value: '0', unit: 'b' })
    expect(splitBytes(1023, 'en')).toEqual({ value: '1,023', unit: 'b' })
  })

  it('switches to kilobytes at 1024 bytes', () => {
    expect(splitBytes(1024, 'en')).toEqual({ value: '1', unit: 'kb' })
  })

  it('shows two decimals below 10 KB and one above', () => {
    expect(splitBytes(7444, 'en')).toEqual({ value: '7.27', unit: 'kb' })
    expect(splitBytes(12_800, 'en')).toEqual({ value: '12.5', unit: 'kb' })
  })

  it('switches to megabytes at 1024 KB', () => {
    expect(splitBytes(5 * 1024 * 1024, 'en')).toEqual({ value: '5', unit: 'mb' })
  })

  it('formats numbers for the locale', () => {
    expect(splitBytes(7444, 'ru').value).toBe('7,27')
    // Russian groups thousands with a no-break space, so "1 023" never wraps
    expect(splitBytes(1023, 'ru').value).toBe('1\u00a0023')
  })
})

describe('formatChange', () => {
  it('shows savings as a negative percentage', () => {
    expect(formatChange(7444, 2233, 'en')).toEqual({ text: '-70%', grew: false })
  })

  it('flags a file that grew', () => {
    expect(formatChange(100, 103, 'en')).toEqual({ text: '+3%', grew: true })
  })

  it('keeps a decimal for small changes', () => {
    expect(formatChange(1000, 996, 'en')?.text).toBe('-0.4%')
  })

  it('shows no sign when nothing changed', () => {
    expect(formatChange(130, 130, 'en')?.text).toBe('0%')
  })

  it('uses the locale', () => {
    expect(formatChange(7444, 2233, 'ru')?.text).toBe('-70\u00a0%')
  })

  it('returns null without a size to compare with', () => {
    expect(formatChange(0, 10, 'en')).toBeNull()
  })
})
