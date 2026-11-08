import { afterEach, expect, it, vi } from "vitest"
import type { Look } from "#/world/scene/figure/look"

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
})

it("delivers an oversized baked strip before closing it, then reloads it when needed", async () => {
  const images: { width: number; height: number; close: ReturnType<typeof vi.fn> }[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, blob: async () => new Blob() })),
  )
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => {
      const image = { width: 8192, height: 4096, close: vi.fn() }
      images.push(image)
      return image
    }),
  )
  const bakedStrip = (await import("#/world/scene/baked-strip")).bakedStrip
  const delivered = vi.fn((image) => {
    expect(image.close).not.toHaveBeenCalled()
  })
  expect(bakedStrip("test-strip.png", 1, delivered)).toBeUndefined()
  await vi.waitFor(() => expect(delivered).toHaveBeenCalledTimes(1))
  expect(images[0].close).toHaveBeenCalledOnce()
  expect(bakedStrip("test-strip.png", 1, delivered)).toBeUndefined()
  await vi.waitFor(() => expect(delivered).toHaveBeenCalledTimes(2))
  expect(images[1].close).toHaveBeenCalledOnce()
})

it("shares a decoded strip across callers without fetching again", async () => {
  const image = { width: 256, height: 256, close: vi.fn() }
  const fetch = vi.fn(async () => ({ ok: true, blob: async () => new Blob() }))
  vi.stubGlobal("fetch", fetch)
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => image),
  )
  const bakedStrip = (await import("#/world/scene/baked-strip")).bakedStrip
  const a = vi.fn(),
    b = vi.fn()
  bakedStrip("test-shared.png", 1, a)
  bakedStrip("test-shared.png", 1, b)
  await vi.waitFor(() => expect(b).toHaveBeenCalledWith(image))
  expect(a).toHaveBeenCalledWith(image)
  expect(bakedStrip("test-shared.png", 1, vi.fn())).toBe(image)
  expect(fetch).toHaveBeenCalledOnce()
  expect(image.close).not.toHaveBeenCalled()
})

it.each(["blocked", "throws"])("keeps worker capacity available when cache access %s", async (failure) => {
  vi.useFakeTimers()
  const jobs: unknown[] = []
  const workers: { onmessage?: (event: { data: unknown }) => void }[] = []
  class WorkerStub {
    onmessage?: (event: { data: unknown }) => void
    constructor() {
      workers.push(this)
    }
    postMessage(job: unknown) {
      jobs.push(job)
    }
  }
  vi.stubGlobal("Worker", WorkerStub)
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 })
  vi.stubGlobal("indexedDB", {
    open: () => {
      if (failure === "throws") throw Error("Storage denied")
      return {}
    },
  })
  const spriteFrame = (await import("#/world/scene/sprite-frame")).spriteFrame,
    spritesPending = (await import("#/world/scene/sprites-pending")).spritesPending
  const delivered = vi.fn()
  spriteFrame({ look: {} as Look, item: null, anim: "idle", view: 0, f: 0, urgency: 0, onReady: delivered, id: "test" })
  await vi.advanceTimersByTimeAsync(5000)
  expect(jobs).toHaveLength(1)
  const bitmap = { width: 1, height: 1, close: vi.fn() }
  workers[0].onmessage?.({ data: { key: "test|idle|0|0", bitmap, png: new Blob() } })
  expect(delivered).toHaveBeenCalledWith(bitmap)
  expect(spritesPending()).toBe(0)
  spriteFrame({ look: {} as Look, item: null, anim: "idle", view: 0, f: 1, urgency: 0, onReady: delivered, id: "test" })
  await vi.advanceTimersByTimeAsync(0)
  expect(jobs).toHaveLength(2)
  await vi.advanceTimersByTimeAsync(5000)
})

it("releases a failed frame's worker, processes other frames and retries only after a delay", async () => {
  vi.useFakeTimers()
  const jobs: { key: string }[] = []
  const workers: { onmessage?: (event: { data: unknown }) => void }[] = []
  class WorkerStub {
    onmessage?: (event: { data: unknown }) => void
    constructor() {
      workers.push(this)
    }
    postMessage(job: { key: string }) {
      jobs.push(job)
    }
  }
  vi.stubGlobal("Worker", WorkerStub)
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 })
  vi.stubGlobal("indexedDB", undefined)
  const spriteFrame = (await import("#/world/scene/sprite-frame")).spriteFrame,
    spritesPending = (await import("#/world/scene/sprites-pending")).spritesPending
  const delivered = vi.fn()
  const request = (f: number) => spriteFrame({ look: {} as Look, item: null, anim: "idle", view: 0, f: f, urgency: 0, onReady: delivered, id: "test" })
  request(0)
  request(1)
  await vi.advanceTimersByTimeAsync(0)
  expect(jobs).toHaveLength(1)
  workers[0].onmessage?.({ data: { key: jobs[0].key, failed: true } })
  await vi.advanceTimersByTimeAsync(0)
  expect(jobs).toHaveLength(2)
  const bitmap = { width: 1, height: 1, close: vi.fn() }
  workers[0].onmessage?.({ data: { key: jobs[1].key, bitmap, png: null } })
  expect(delivered).toHaveBeenCalledExactlyOnceWith(bitmap)
  expect(spritesPending()).toBe(0)
  request(0)
  await vi.advanceTimersByTimeAsync(4999)
  request(0)
  expect(spritesPending()).toBe(0)
  await vi.advanceTimersByTimeAsync(1)
  request(0)
  await vi.advanceTimersByTimeAsync(0)
  expect(jobs).toHaveLength(3)
  workers[0].onmessage?.({ data: { key: jobs[2].key, bitmap, png: null } })
  expect(delivered).toHaveBeenCalledTimes(2)
  expect(spritesPending()).toBe(0)
})
