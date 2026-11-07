import { wrap } from 'comlink'
import type { Config } from 'svgo/browser'
import type { OptimizeOutput, SvgoWorkerApi } from './svgo.worker'

/** A pathological file must not keep a worker busy forever. */
export const TIMEOUT_MS = 20_000

/** The run was replaced or stopped. Not an error to show anyone. */
export class OptimizerCancelledError extends Error {
  constructor() {
    super('Optimization was cancelled')
    this.name = 'OptimizerCancelledError'
  }
}

export class OptimizerTimeoutError extends Error {
  constructor(timeoutMs = TIMEOUT_MS) {
    super(`Optimization took longer than ${timeoutMs / 1000} s`)
    this.name = 'OptimizerTimeoutError'
  }
}

/** What a slot needs from a worker; tests pass a fake. */
export interface WorkerConnection {
  optimize(markup: string, config: Config): Promise<OptimizeOutput>
  terminate(): void
}

/** Starts the real SVGO worker. Vite bundles it, with SVGO, into a separate file. */
export function connectSvgoWorker(): WorkerConnection {
  const worker = new Worker(new URL('./svgo.worker.ts', import.meta.url), { type: 'module' })
  const remote = wrap<SvgoWorkerApi>(worker)
  return {
    optimize: (markup, config) => remote.optimize(markup, config),
    terminate: () => worker.terminate(),
  }
}

interface Job {
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
}

/**
 * One worker that runs one optimization at a time.
 *
 * A worker can't be interrupted mid-task, so cancelling or timing out terminates it;
 * the next run starts a fresh one. The worker itself starts lazily, on the first run.
 */
export class WorkerSlot {
  private readonly connect: () => WorkerConnection
  private readonly timeoutMs: number
  private connection: WorkerConnection | null = null
  private job: Job | null = null

  constructor(connect: () => WorkerConnection = connectSvgoWorker, timeoutMs = TIMEOUT_MS) {
    this.connect = connect
    this.timeoutMs = timeoutMs
  }

  get busy(): boolean {
    return this.job !== null
  }

  run(markup: string, config: Config): Promise<OptimizeOutput> {
    if (this.job) return Promise.reject(new Error('WorkerSlot is busy; cancel() first'))

    this.connection ??= this.connect()
    const connection = this.connection

    return new Promise<OptimizeOutput>((resolve, reject) => {
      const job: Job = {
        reject,
        timer: setTimeout(() => {
          this.finish(job)
          this.terminate()
          reject(new OptimizerTimeoutError(this.timeoutMs))
        }, this.timeoutMs),
      }
      this.job = job

      connection.optimize(markup, config).then(
        (output) => {
          if (this.job !== job) return // cancelled or timed out meanwhile
          this.finish(job)
          resolve(output)
        },
        (error: unknown) => {
          if (this.job !== job) return
          this.finish(job)
          reject(error instanceof Error ? error : new Error(String(error)))
        },
      )
    })
  }

  /** Stops the run in progress, if any: its promise rejects with OptimizerCancelledError. */
  cancel(): void {
    const job = this.job
    if (!job) return
    this.finish(job)
    this.terminate()
    job.reject(new OptimizerCancelledError())
  }

  /** Cancels and frees the worker. */
  dispose(): void {
    this.cancel()
    this.terminate()
  }

  private finish(job: Job) {
    clearTimeout(job.timer)
    if (this.job === job) this.job = null
  }

  private terminate() {
    this.connection?.terminate()
    this.connection = null
  }
}
