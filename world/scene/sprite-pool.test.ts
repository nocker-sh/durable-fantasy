import { afterEach, expect, it, vi } from "vitest"

afterEach(() => {
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
