import { type Remote, wrap } from 'comlink'
import type { Config } from 'svgo/browser'
import type { OptimizeOutput, SvgoWorkerApi } from './svgo.worker'

/** A pathological file must not keep the worker busy forever. */
const TIMEOUT_MS = 20_000

/** The run was replaced by a newer one. Not an error to show anyone. */
export class OptimizerCancelledError extends Error {
  constructor() {
    super('Optimization was superseded by a newer run')
    this.name = 'OptimizerCancelledError'
  }
}

export class OptimizerTimeoutError extends Error {
  constructor() {
    super(`Optimization took longer than ${TIMEOUT_MS / 1000} s`)
    this.name = 'OptimizerTimeoutError'
  }
}

interface Job {
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
}

let worker: Worker | null = null
let api: Remote<SvgoWorkerApi> | null = null
let currentJob: Job | null = null

function getApi(): Remote<SvgoWorkerApi> {
  if (!api) {
    // Vite bundles the worker and its SVGO dependency into a separate file,
    // loaded only when the first optimization runs.
    worker = new Worker(new URL('./svgo.worker.ts', import.meta.url), { type: 'module' })
    api = wrap<SvgoWorkerApi>(worker)
  }
  return api
}

/** Kills the worker. The next call starts a fresh one. */
function terminate() {
  worker?.terminate()
  worker = null
  api = null
}

function finish(job: Job) {
  clearTimeout(job.timer)
  if (currentJob === job) currentJob = null
}

/**
 * Optimizes markup in the worker.
 *
 * A worker runs one task at a time, so if a run is still in progress when a new one
 * is requested (the user keeps toggling options on a big file), waiting would only
 * pile up stale work. Instead the old run is cancelled and its worker terminated.
 */
export function optimizeSvg(markup: string, config: Config): Promise<OptimizeOutput> {
  if (currentJob) {
    const stale = currentJob
    finish(stale)
    stale.reject(new OptimizerCancelledError())
    terminate()
  }

  const remote = getApi()

  return new Promise<OptimizeOutput>((resolve, reject) => {
    const job: Job = {
      reject,
      timer: setTimeout(() => {
        finish(job)
        terminate()
        reject(new OptimizerTimeoutError())
      }, TIMEOUT_MS),
    }
    currentJob = job

    remote.optimize(markup, config).then(
      (output) => {
        if (currentJob !== job) return // cancelled or timed out meanwhile
        finish(job)
        resolve(output)
      },
      (error: unknown) => {
        if (currentJob !== job) return
        finish(job)
        reject(error instanceof Error ? error : new Error(String(error)))
      },
    )
  })
}
