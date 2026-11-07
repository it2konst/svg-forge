import { describe, expect, it } from 'vitest'
import { defaultConcurrency, runQueue } from './queue'

/** A promise the test resolves by hand. */
function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((r) => (resolve = r))
  return { promise, resolve }
}

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('runQueue', () => {
  it('processes every item', async () => {
    const seen: number[] = []
    await runQueue([1, 2, 3, 4, 5], 2, async (item) => {
      seen.push(item)
    })
    expect(seen.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('never runs more tasks at once than allowed', async () => {
    let running = 0
    let peak = 0
    await runQueue(
      Array.from({ length: 20 }, (_, i) => i),
      3,
      async () => {
        running++
        peak = Math.max(peak, running)
        await tick()
        running--
      },
    )
    expect(peak).toBe(3)
  })

  it('lets a free lane take the next item while another is still busy', async () => {
    const slow = deferred()
    const order: string[] = []
    const run = runQueue(['slow', 'a', 'b', 'c'], 2, async (item) => {
      if (item === 'slow') await slow.promise
      order.push(item)
    })
    await tick()
    expect(order).toEqual(['a', 'b', 'c'])
    slow.resolve()
    await run
    expect(order).toEqual(['a', 'b', 'c', 'slow'])
  })

  it('gives each lane its own number', async () => {
    const lanes = new Set<number>()
    await runQueue([1, 2, 3, 4], 2, async (_item, lane) => {
      lanes.add(lane)
      await tick()
    })
    expect([...lanes].sort()).toEqual([0, 1])
  })

  it('keeps going after a task fails', async () => {
    const done: number[] = []
    await runQueue([1, 2, 3], 1, async (item) => {
      if (item === 2) throw new Error('broken file')
      done.push(item)
    })
    expect(done).toEqual([1, 3])
  })

  it('stops taking new items once asked to', async () => {
    let stop = false
    const done: number[] = []
    await runQueue(
      [1, 2, 3, 4],
      1,
      async (item) => {
        done.push(item)
        if (item === 2) stop = true
      },
      () => stop,
    )
    expect(done).toEqual([1, 2])
  })

  it('handles an empty list and odd concurrency values', async () => {
    await expect(runQueue([], 4, async () => {})).resolves.toBeUndefined()
    const seen: number[] = []
    await runQueue([1, 2], 0, async (item) => {
      seen.push(item)
    })
    expect(seen).toEqual([1, 2])
  })
})

describe('defaultConcurrency', () => {
  it('leaves one core for the UI and caps at four', () => {
    expect(defaultConcurrency(1)).toBe(1)
    expect(defaultConcurrency(2)).toBe(1)
    expect(defaultConcurrency(4)).toBe(3)
    expect(defaultConcurrency(16)).toBe(4)
  })
})
