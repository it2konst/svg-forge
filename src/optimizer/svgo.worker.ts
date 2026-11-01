/**
 * Runs SVGO off the main thread, so optimizing a heavy file never freezes the UI.
 * Comlink turns postMessage into plain async function calls on the other side.
 */
import { expose } from 'comlink'
import { type Config, optimize } from 'svgo/browser'

export interface OptimizeOutput {
  markup: string
  /** Time spent inside SVGO, in milliseconds. */
  ms: number
}

const api = {
  optimize(markup: string, config: Config): OptimizeOutput {
    const start = performance.now()
    const { data } = optimize(markup, config)
    return { markup: data, ms: performance.now() - start }
  },
}

export type SvgoWorkerApi = typeof api

expose(api)
