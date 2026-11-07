/**
 * Runs `task` for every item with at most `concurrency` tasks at once.
 *
 * Each parallel lane has a number (0, 1, …), so a task can use a resource that
 * belongs to its lane, such as its own worker. Lanes pull the next item as soon as
 * they finish one, so a slow file doesn't hold up the others.
 *
 * A failing task does not stop the queue: tasks are expected to record their own
 * errors. `shouldStop` is checked before each item, to abandon a run early.
 */
export async function runQueue<T>(
  items: readonly T[],
  concurrency: number,
  task: (item: T, lane: number) => Promise<void>,
  shouldStop: () => boolean = () => false,
): Promise<void> {
  let next = 0
  const laneCount = Math.max(1, Math.min(Math.floor(concurrency), items.length))

  const lane = async (laneIndex: number) => {
    while (!shouldStop()) {
      const index = next++
      if (index >= items.length) return
      try {
        await task(items[index] as T, laneIndex)
      } catch {
        // Recorded by the task itself; keep the lane going.
      }
    }
  }

  await Promise.all(Array.from({ length: laneCount }, (_, index) => lane(index)))
}

/** Parallel workers for this device: leave a core for the UI, cap at 4. */
export function defaultConcurrency(cores = globalThis.navigator?.hardwareConcurrency ?? 2): number {
  return Math.min(4, Math.max(1, cores - 1))
}
