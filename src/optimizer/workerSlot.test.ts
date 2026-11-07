import type { Config } from 'svgo/browser'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OptimizeOutput } from './svgo.worker'
import {
  OptimizerCancelledError,
  OptimizerTimeoutError,
  type WorkerConnection,
  WorkerSlot,
} from './workerSlot'

const config: Config = {}
const output = (markup: string): OptimizeOutput => ({ markup, ms: 1, gzipBytes: 10 })

/** A fake worker whose runs finish only when the test says so. */
function fakeWorker() {
  const pending: { resolve: (o: OptimizeOutput) => void; reject: (e: Error) => void }[] = []
  const connections: { terminated: boolean }[] = []
  const connect = (): WorkerConnection => {
    const state = { terminated: false }
    connections.push(state)
    return {
      optimize: () =>
        new Promise<OptimizeOutput>((resolve, reject) => pending.push({ resolve, reject })),
      terminate: () => (state.terminated = true),
    }
  }
  return { connect, pending, connections }
}

describe('WorkerSlot', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts the worker lazily, on the first run', () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect)
    expect(fake.connections).toHaveLength(0)
    void slot.run('<svg/>', config)
    expect(fake.connections).toHaveLength(1)
  })

  it('resolves with the worker output and reuses the worker', async () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect)

    const first = slot.run('<svg/>', config)
    fake.pending[0]!.resolve(output('a'))
    await expect(first).resolves.toEqual(output('a'))
    expect(slot.busy).toBe(false)

    const second = slot.run('<svg/>', config)
    fake.pending[1]!.resolve(output('b'))
    await expect(second).resolves.toEqual(output('b'))
    expect(fake.connections).toHaveLength(1)
  })

  it('passes worker errors on', async () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect)
    const run = slot.run('<svg/>', config)
    fake.pending[0]!.reject(new Error('SVGO failed'))
    await expect(run).rejects.toThrow('SVGO failed')
  })

  it('refuses a second run while busy', async () => {
    const slot = new WorkerSlot(fakeWorker().connect)
    void slot.run('<svg/>', config)
    await expect(slot.run('<svg/>', config)).rejects.toThrow(/busy/)
  })

  it('cancel() rejects the run, terminates the worker, and the next run starts a new one', async () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect)
    const run = slot.run('<svg/>', config)

    slot.cancel()
    await expect(run).rejects.toBeInstanceOf(OptimizerCancelledError)
    expect(fake.connections[0]!.terminated).toBe(true)
    expect(slot.busy).toBe(false)

    // A late answer from the killed worker is ignored.
    fake.pending[0]!.resolve(output('late'))

    void slot.run('<svg/>', config)
    expect(fake.connections).toHaveLength(2)
  })

  it('cancel() does nothing when idle', () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect)
    slot.cancel()
    expect(fake.connections).toHaveLength(0)
  })

  it('times out, terminates the worker, and recovers', async () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect, 1000)
    const run = slot.run('<svg/>', config)

    vi.advanceTimersByTime(1000)
    await expect(run).rejects.toBeInstanceOf(OptimizerTimeoutError)
    expect(fake.connections[0]!.terminated).toBe(true)

    const next = slot.run('<svg/>', config)
    fake.pending[1]!.resolve(output('ok'))
    await expect(next).resolves.toEqual(output('ok'))
  })

  it('does not time out a run that finished in time', async () => {
    const fake = fakeWorker()
    const slot = new WorkerSlot(fake.connect, 1000)
    const run = slot.run('<svg/>', config)
    fake.pending[0]!.resolve(output('fast'))
    await expect(run).resolves.toEqual(output('fast'))

    vi.advanceTimersByTime(5000)
    expect(fake.connections[0]!.terminated).toBe(false)
  })
})
