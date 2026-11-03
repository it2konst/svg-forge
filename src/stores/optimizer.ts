import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { useStorage, watchDebounced } from '@vueuse/core'
import { OptimizerCancelledError, OptimizerTimeoutError, optimizeSvg } from '@/optimizer/client'
import {
  buildSvgoConfig,
  defaultSettings,
  mergeWithDefaults,
  type OptimizerSettings,
} from '@/optimizer/config'
import { useDocumentStore } from '@/stores/document'
import { gzipSize } from '@/utils/gzip'
import { byteLength } from '@/utils/svg'

export interface OptimizedResult {
  markup: string
  bytes: number
  gzipBytes: number
  /** Time spent in SVGO, ms. */
  ms: number
}

export type OptimizerStatus = 'idle' | 'running' | 'done' | 'error'

export interface OptimizerError {
  code: 'timeout' | 'failed'
  detail: string
  /** Changes on every failure, so watchers fire even for the same error twice. */
  id: number
}

/**
 * Optimizer settings (persisted) and the result for the current document.
 * Re-runs automatically when the document or any setting changes.
 */
export const useOptimizerStore = defineStore('optimizer', () => {
  const documentStore = useDocumentStore()

  const settings = useStorage<OptimizerSettings>(
    'svg-forge:optimizer',
    defaultSettings(),
    undefined,
    {
      mergeDefaults: (stored) => mergeWithDefaults(stored),
    },
  )

  const result = shallowRef<OptimizedResult | null>(null)
  const status = ref<OptimizerStatus>('idle')
  const error = ref<OptimizerError | null>(null)
  /** Gzipped size of the original document, for the "compare gzipped" mode. */
  const originalGzipBytes = ref<number | null>(null)

  let runId = 0

  async function run() {
    const id = ++runId
    const doc = documentStore.current
    if (!doc) {
      result.value = null
      status.value = 'idle'
      return
    }

    status.value = 'running'
    try {
      const output = await optimizeSvg(doc.markup, buildSvgoConfig(settings.value))
      if (id !== runId) return // a newer run has started since
      result.value = {
        markup: output.markup,
        bytes: byteLength(output.markup),
        gzipBytes: output.gzipBytes,
        ms: output.ms,
      }
      status.value = 'done'
      error.value = null
    } catch (cause) {
      if (cause instanceof OptimizerCancelledError || id !== runId) return
      result.value = null
      status.value = 'error'
      error.value = {
        code: cause instanceof OptimizerTimeoutError ? 'timeout' : 'failed',
        detail: cause instanceof Error ? cause.message : String(cause),
        id,
      }
    }
  }

  function resetSettings() {
    settings.value = defaultSettings()
  }

  // New document: drop the old result right away, then optimize.
  watch(
    () => documentStore.current,
    (doc) => {
      result.value = null
      originalGzipBytes.value = null
      void run()
      if (doc) {
        void gzipSize(doc.markup).then((size) => {
          if (documentStore.current === doc) originalGzipBytes.value = size
        })
      }
    },
    { immediate: true },
  )

  // Settings: wait until the user stops dragging a slider or clicking switches.
  watchDebounced(settings, () => void run(), { deep: true, debounce: 150 })

  return { settings, result, status, error, originalGzipBytes, resetSettings }
})
