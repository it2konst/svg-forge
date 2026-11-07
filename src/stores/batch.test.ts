import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as WorkerSlotModule from '@/optimizer/workerSlot'
import { MAX_BATCH_FILES, useBatchStore } from './batch'
import { useOptimizerStore } from './optimizer'

/** Every run the fake workers were asked to do: the markup and the config. */
const runs = vi.hoisted(() => [] as { markup: string; floatPrecision: unknown }[])

// Real error classes, fake workers: optimizing just tags the markup.
vi.mock('@/optimizer/workerSlot', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkerSlotModule>()
  class FakeSlot {
    async run(markup: string, config: { floatPrecision?: number }) {
      runs.push({ markup, floatPrecision: config.floatPrecision })
      if (markup.includes('slow')) throw new actual.OptimizerTimeoutError(1)
      return { markup: '<svg xmlns="http://www.w3.org/2000/svg"/>', ms: 1, gzipBytes: 7 }
    }
    cancel() {}
    dispose() {}
  }
  return { ...actual, WorkerSlot: FakeSlot }
})

// jsdom has no streaming Blob; gzip itself is tested elsewhere.
vi.mock('@/utils/gzip', () => ({ gzipSize: async (text: string) => Math.ceil(text.length / 2) }))

const svgFile = (name: string, body = '<circle r="1"/>') =>
  new File([`<svg xmlns="http://www.w3.org/2000/svg">${body}</svg>`], name, {
    type: 'image/svg+xml',
  })

describe('batch store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    runs.length = 0
  })

  // useStorage keeps every settings store in the window in sync, so a batch left
  // over from an earlier test would re-run when this test changes a setting.
  afterEach(() => useBatchStore().clear())

  it('reads, queues and optimizes every SVG file', async () => {
    const batch = useBatchStore()
    const outcome = await batch.addFiles([svgFile('a.svg'), svgFile('b.svg')])

    expect(outcome).toEqual({ added: 2, skippedNotSvg: 0, skippedOverLimit: 0 })
    await vi.waitFor(() => expect(batch.running).toBe(false))
    expect(batch.items.map((item) => [item.name, item.status])).toEqual([
      ['a.svg', 'done'],
      ['b.svg', 'done'],
    ])
    expect(batch.items[0]?.result?.bytes).toBe(41)
    expect(batch.items[0]?.gzipBytes).toBeGreaterThan(0)
  })

  it('skips files that are not SVG and lists broken SVG as an error', async () => {
    const batch = useBatchStore()
    const outcome = await batch.addFiles([
      svgFile('ok.svg'),
      new File(['png'], 'photo.png', { type: 'image/png' }),
      new File(['<svg><g></svg>'], 'broken.svg'),
    ])

    expect(outcome).toMatchObject({ added: 2, skippedNotSvg: 1 })
    await vi.waitFor(() => expect(batch.running).toBe(false))
    const broken = batch.items.find((item) => item.name === 'broken.svg')
    expect(broken).toMatchObject({ status: 'error', error: 'invalidXml', markup: null })
    expect(batch.failed).toBe(1)
    // Broken files never reach a worker.
    expect(runs).toHaveLength(1)
  })

  it('marks a file that times out, and finishes the others', async () => {
    const batch = useBatchStore()
    await batch.addFiles([svgFile('slow.svg', '<text>slow</text>'), svgFile('fast.svg')])
    await vi.waitFor(() => expect(batch.running).toBe(false))
    expect(batch.items.map((item) => item.status)).toEqual(['error', 'done'])
    expect(batch.items[0]?.error).toBe('timeout')
  })

  it('stops at the file limit and says how many were left out', async () => {
    const batch = useBatchStore()
    const files = Array.from({ length: MAX_BATCH_FILES + 3 }, (_, i) => svgFile(`${i}.svg`))
    const outcome = await batch.addFiles(files)
    expect(outcome).toMatchObject({ added: MAX_BATCH_FILES, skippedOverLimit: 3 })
    await vi.waitFor(() => expect(batch.running).toBe(false))
  })

  it('adds more files without optimizing the finished ones again', async () => {
    const batch = useBatchStore()
    await batch.addFiles([svgFile('a.svg')])
    await vi.waitFor(() => expect(batch.running).toBe(false))
    await batch.addFiles([svgFile('b.svg')])
    await vi.waitFor(() => expect(batch.running).toBe(false))
    expect(runs).toHaveLength(2)
    expect(batch.totals).toMatchObject({ files: 2, done: 2 })
  })

  it('optimizes everything again with the new settings', async () => {
    const batch = useBatchStore()
    const optimizer = useOptimizerStore()
    await batch.addFiles([svgFile('a.svg'), svgFile('b.svg')])
    await vi.waitFor(() => expect(batch.running).toBe(false))

    optimizer.settings.floatPrecision = 1
    await vi.waitFor(() => expect(runs).toHaveLength(4), { timeout: 2000 })
    await vi.waitFor(() => expect(batch.running).toBe(false))
    expect(runs.slice(2).map((run) => run.floatPrecision)).toEqual([1, 1])
  })

  it('adds up the sizes of finished files', async () => {
    const batch = useBatchStore()
    await batch.addFiles([svgFile('a.svg'), svgFile('b.svg')])
    await vi.waitFor(() => expect(batch.running).toBe(false))
    const each = batch.items[0]!.bytes
    expect(batch.totals).toMatchObject({
      originalBytes: each * 2,
      optimizedBytes: 82,
      optimizedGzipBytes: 14,
    })
  })

  it('removes single files and clears the whole batch', async () => {
    const batch = useBatchStore()
    await batch.addFiles([svgFile('a.svg'), svgFile('b.svg')])
    batch.remove(batch.items[0]!.id)
    expect(batch.items.map((item) => item.name)).toEqual(['b.svg'])
    batch.clear()
    expect(batch.hasItems).toBe(false)
  })
})
