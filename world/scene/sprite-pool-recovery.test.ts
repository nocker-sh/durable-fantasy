import { afterEach, expect, it, vi } from "vitest"
import type { Look } from "#/world/scene/figure/look"

class WorkerStub {
  static all: WorkerStub[] = []
  static failConstruction = false
  static failPost = false
  onmessage?: (event: { data: unknown }) => void
  onerror?: () => void
  onmessageerror?: () => void
  jobs: { key: string }[] = []
  terminate = vi.fn()
  constructor() {
    if (WorkerStub.failConstruction) throw Error("Worker unavailable")
    WorkerStub.all.push(this)
  }
  postMessage(job: { key: string }) {
    if (WorkerStub.failPost) throw Error("Cannot send job")
    this.jobs.push(job)
  }
  finish() {
    const bitmap = { width: 1, height: 1, close: vi.fn() }
    this.onmessage?.({ data: { key: this.jobs.at(-1)!.key, bitmap, png: null } })
    return bitmap
  }
}
async function setup() {
  vi.useFakeTimers()
  vi.stubGlobal("Worker", WorkerStub)
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 })
  vi.stubGlobal("indexedDB", undefined)
  const pool = {
    ...(await import("#/world/scene/sprite-pool")),
    ...(await import("#/world/scene/tick-sprites")),
    ...(await import("#/world/scene/sprite-frame")),
    ...(await import("#/world/scene/ready-frame")),
    ...(await import("#/world/scene/sprites-pending")),
    ...(await import("#/world/scene/baked-strip")),
  }
  const delivered = vi.fn()
  const request = (f: number) => pool.spriteFrame({ look: {} as Look, item: null, anim: "idle", view: 0, f: f, urgency: 0, onReady: delivered, id: "test" })
  return { ...pool, delivered, request }
}
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
  WorkerStub.all = []
  WorkerStub.failConstruction = false
  WorkerStub.failPost = false
})

it("delays repeated construction failures and eventually renders the queued frame", async () => {
  const pool = await setup()
  WorkerStub.failConstruction = true
  expect(() => pool.request(0)).not.toThrow()
  await vi.advanceTimersByTimeAsync(5000)
  expect(WorkerStub.all).toHaveLength(0)
  expect(vi.getTimerCount()).toBe(1)
  WorkerStub.failConstruction = false
  await vi.advanceTimersByTimeAsync(5000)
  expect(WorkerStub.all).toHaveLength(1)
  const bitmap = WorkerStub.all[0].finish()
  expect(pool.delivered).toHaveBeenCalledWith(bitmap)
  expect(pool.spritesPending()).toBe(0)
})

it.each(["onerror", "onmessageerror", "post"] as const)("replaces a worker after %s and preserves queued work", async (failure) => {
  const pool = await setup()
  WorkerStub.failPost = failure === "post"
  pool.request(0)
  pool.request(1)
  await vi.advanceTimersByTimeAsync(0)
  const old = WorkerStub.all[0]
  if (failure !== "post") old[failure]?.()
  // Duplicate failure events must not create extra workers.
  old.onerror?.()
  old.onmessageerror?.()
  expect(old.terminate).toHaveBeenCalledOnce()
  expect(pool.spritesPending()).toBe(1)
  WorkerStub.failPost = false
  await vi.advanceTimersByTimeAsync(4999)
  expect(WorkerStub.all).toHaveLength(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(WorkerStub.all).toHaveLength(2)
  const replacement = WorkerStub.all[1]
  expect(replacement.jobs[0].key).toBe("test|idle|0|1")
  replacement.finish()
  pool.request(0)
  await vi.advanceTimersByTimeAsync(0)
  expect(replacement.jobs[1].key).toBe("test|idle|0|0")
  // A late result from the retired worker cannot finish this retry.
  const stale = { close: vi.fn() }
  old.onmessage?.({ data: { key: "test|idle|0|0", bitmap: stale, png: null } })
  expect(stale.close).toHaveBeenCalledOnce()
  expect(pool.spritesPending()).toBe(1)
  replacement.finish()
  expect(pool.delivered).toHaveBeenCalledTimes(2)
  expect(pool.spritesPending()).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
})

it("discards a cache result arriving after its reserved worker has failed", async () => {
  const pool = await setup()
  const image = { width: 1, height: 1, close: vi.fn() }
  let decoded!: (value: typeof image) => void
  vi.stubGlobal(
    "createImageBitmap",
    () =>
      new Promise((resolve) => {
        decoded = resolve
      }),
  )
  vi.stubGlobal("indexedDB", {
    open: () => {
      const req: { onsuccess?: () => void; result: unknown } = {
        result: {
          transaction: () => ({
            objectStore: () => ({
              get: () => {
                const read = { result: new Blob(), onsuccess: undefined as undefined | (() => void) }
                queueMicrotask(() => read.onsuccess?.())
                return read
              },
            }),
          }),
        },
      }
      queueMicrotask(() => req.onsuccess?.())
      return req
    },
  })
  pool.request(0)
  await vi.advanceTimersByTimeAsync(0)
  const old = WorkerStub.all[0]
  old.onerror?.()
  decoded(image)
  await vi.advanceTimersByTimeAsync(0)
  expect(image.close).toHaveBeenCalledOnce()
  expect(pool.delivered).not.toHaveBeenCalled()
  expect(old.jobs).toHaveLength(0)
  expect(pool.spritesPending()).toBe(0)
  await vi.advanceTimersByTimeAsync(5000)
  expect(WorkerStub.all).toHaveLength(2)
})
