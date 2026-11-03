/**
 * Runs SVGO off the main thread, so optimizing a heavy file never freezes the UI.
 * Comlink turns postMessage into plain async function calls on the other side.
 */
import { expose } from 'comlink'
import { type Config, optimize } from 'svgo/browser'
import { gzipSize } from '@/utils/gzip'

export interface OptimizeOutput {
  markup: string
  /** Time spent inside SVGO, in milliseconds. */
  ms: number
  gzipBytes: number
}

const api = {
  async optimize(markup: string, config: Config): Promise<OptimizeOutput> {
    const start = performance.now()
    const { data } = optimize(markup, config)
    const ms = performance.now() - start
    return { markup: data, ms, gzipBytes: await gzipSize(data) }
  },
}

export type SvgoWorkerApi = typeof api

expose(api)
