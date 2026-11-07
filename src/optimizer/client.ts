import type { Config } from 'svgo/browser'
import type { OptimizeOutput } from './svgo.worker'
import { WorkerSlot } from './workerSlot'

export { OptimizerCancelledError, OptimizerTimeoutError } from './workerSlot'

/** The worker behind the single-file editor. Starts on the first optimization. */
const interactive = new WorkerSlot()

/**
 * Optimizes markup for the editor.
 *
 * Only the latest request matters: if a run is still in progress when a new one
 * arrives (the user keeps toggling options on a big file), the old run is cancelled
 * and its worker terminated instead of piling up stale work.
 */
export function optimizeSvg(markup: string, config: Config): Promise<OptimizeOutput> {
  interactive.cancel()
  return interactive.run(markup, config)
}
