import { afterEach, expect, it, vi } from "vitest"
import type { Look } from "./figure"

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
  const { bakedStrip } = await import("./sprite-pool.ts")
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
  const { bakedStrip } = await import("./sprite-pool.ts")
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
  const { spriteFrame, spritesPending } = await import("./sprite-pool.ts")
  const delivered = vi.fn()
  spriteFrame({} as Look, null, "idle", 0, 0, 0, delivered, "test")
  await vi.advanceTimersByTimeAsync(5000)
  expect(jobs).toHaveLength(1)
  const bitmap = { width: 1, height: 1, close: vi.fn() }
  workers[0].onmessage?.({ data: { key: "test|idle|0|0", bitmap, png: new Blob() } })
  expect(delivered).toHaveBeenCalledWith(bitmap)
  expect(spritesPending()).toBe(0)
  spriteFrame({} as Look, null, "idle", 0, 1, 0, delivered, "test")
  await vi.advanceTimersByTimeAsync(0)
  expect(jobs).toHaveLength(2)
  await vi.advanceTimersByTimeAsync(5000)
})
