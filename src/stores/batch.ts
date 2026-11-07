import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { buildSvgoConfig } from '@/optimizer/config'
import { defaultConcurrency, runQueue } from '@/optimizer/queue'
import { OptimizerCancelledError, OptimizerTimeoutError, WorkerSlot } from '@/optimizer/workerSlot'
import { useOptimizerStore } from '@/stores/optimizer'
import { gzipSize } from '@/utils/gzip'
import {
  byteLength,
  looksLikeSvgFile,
  readSvgFile,
  SvgInputError,
  type SvgErrorCode,
} from '@/utils/svg'

export type BatchStatus = 'queued' | 'running' | 'done' | 'error'
export type BatchErrorCode = SvgErrorCode | 'readFailed' | 'timeout' | 'failed'

export interface BatchResult {
  markup: string
  bytes: number
  gzipBytes: number
}

export interface BatchItem {
  id: string
  name: string
  /** Validated markup; null when the file could not be read as SVG. */
  markup: string | null
  bytes: number
  gzipBytes: number | null
  status: BatchStatus
  result: BatchResult | null
  error: BatchErrorCode | null
}

/** More than this in one go would make the list and the zip unwieldy in a browser tab. */
export const MAX_BATCH_FILES = 500

export interface AddFilesOutcome {
  added: number
  skippedNotSvg: number
  skippedOverLimit: number
}

/**
 * Many SVG files optimized with the same settings, several workers at a time.
 * Re-runs everything when a setting changes.
 */
export const useBatchStore = defineStore('batch', () => {
  const optimizer = useOptimizerStore()

  const items = ref<BatchItem[]>([])
  const concurrency = defaultConcurrency()
  const slots: WorkerSlot[] = []
  /** Bumped by every run; older runs see the change and stop writing results. */
  let generation = 0

  const hasItems = computed(() => items.value.length > 0)
  const done = computed(() => items.value.filter((item) => item.status === 'done'))
  const running = computed(() =>
    items.value.some((item) => item.status === 'queued' || item.status === 'running'),
  )
  const failed = computed(() => items.value.filter((item) => item.status === 'error').length)

  const totals = computed(() => ({
    files: items.value.length,
    done: done.value.length,
    originalBytes: done.value.reduce((sum, item) => sum + item.bytes, 0),
    optimizedBytes: done.value.reduce((sum, item) => sum + (item.result?.bytes ?? 0), 0),
    originalGzipBytes: done.value.reduce((sum, item) => sum + (item.gzipBytes ?? 0), 0),
    optimizedGzipBytes: done.value.reduce((sum, item) => sum + (item.result?.gzipBytes ?? 0), 0),
  }))

  function update(id: string, patch: Partial<BatchItem>) {
    const index = items.value.findIndex((item) => item.id === id)
    const current = items.value[index]
    if (current) items.value[index] = { ...current, ...patch }
  }

  async function readItem(file: File): Promise<BatchItem> {
    const base = { id: crypto.randomUUID(), name: file.name, result: null, gzipBytes: null }
    try {
      const markup = await readSvgFile(file)
      return { ...base, markup, bytes: byteLength(markup), status: 'queued', error: null }
    } catch (error) {
      const code = error instanceof SvgInputError ? error.code : 'readFailed'
      return { ...base, markup: null, bytes: file.size, status: 'error', error: code }
    }
  }

  /** Adds files to the batch and starts optimizing the new ones. */
  async function addFiles(files: readonly File[]): Promise<AddFilesOutcome> {
    const svgFiles = files.filter(looksLikeSvgFile)
    const room = Math.max(0, MAX_BATCH_FILES - items.value.length)
    const accepted = svgFiles.slice(0, room)

    const newItems = await Promise.all(accepted.map(readItem))
    items.value.push(...newItems)
    for (const item of newItems) {
      if (item.markup) {
        const markup = item.markup
        void gzipSize(markup).then((size) => update(item.id, { gzipBytes: size }))
      }
    }
    if (newItems.some((item) => item.status === 'queued')) start(false)

    return {
      added: newItems.length,
      skippedNotSvg: files.length - svgFiles.length,
      skippedOverLimit: svgFiles.length - accepted.length,
    }
  }

  /**
   * Optimizes queued items, or every readable item when `restart` is set
   * (the settings changed). Any run still in progress is cancelled first.
   */
  function start(restart: boolean) {
    const runId = ++generation
    slots.forEach((slot) => slot.cancel())

    items.value = items.value.map((item) => {
      if (!item.markup) return item
      if (restart || item.status !== 'done') {
        return { ...item, status: 'queued', error: null, result: restart ? null : item.result }
      }
      return item
    })

    const config = buildSvgoConfig(optimizer.settings)
    const queue = items.value.filter((item) => item.status === 'queued').map((item) => item.id)

    void runQueue(
      queue,
      concurrency,
      async (id, lane) => {
        const item = items.value.find((candidate) => candidate.id === id)
        if (!item?.markup) return
        update(id, { status: 'running' })
        const slot = (slots[lane] ??= new WorkerSlot())
        try {
          const output = await slot.run(item.markup, config)
          if (runId !== generation) return
          update(id, {
            status: 'done',
            result: {
              markup: output.markup,
              bytes: byteLength(output.markup),
              gzipBytes: output.gzipBytes,
            },
          })
        } catch (error) {
          if (runId !== generation || error instanceof OptimizerCancelledError) return
          update(id, {
            status: 'error',
            error: error instanceof OptimizerTimeoutError ? 'timeout' : 'failed',
          })
        }
      },
      () => runId !== generation,
    )
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
    if (!items.value.length) clear()
  }

  /** Empties the batch and frees every worker. */
  function clear() {
    generation++
    slots.splice(0).forEach((slot) => slot.dispose())
    items.value = []
  }

  // New settings: optimize everything again, once the user stops changing them.
  let restartTimer: ReturnType<typeof setTimeout> | undefined
  watch(
    () => optimizer.settings,
    () => {
      clearTimeout(restartTimer)
      if (hasItems.value) restartTimer = setTimeout(() => start(true), 300)
    },
    { deep: true },
  )

  return { items, hasItems, done, running, failed, totals, addFiles, remove, clear }
})
