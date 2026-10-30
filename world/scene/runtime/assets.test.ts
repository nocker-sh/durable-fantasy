import { SPRITE_RENDER_VERSION } from "../sprite-render-version"
import { afterEach, expect, it, vi } from "vitest"
vi.mock("../../maps/index", () => ({ MAPS: { phanthiet: { assets: { sprites: "/sprites" } } } }))
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
})
const manifest = { rendererVersion: SPRITE_RENDER_VERSION, frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 8 } }] }
it("shares a validated manifest across concurrent map entries", async () => {
  const fetcher = vi.fn(async () => Response.json(manifest))
  vi.stubGlobal("fetch", fetcher)
  const { spriteManifest } = await import("./assets")
  const first = spriteManifest(),
    second = spriteManifest()
  expect(first).toBe(second)
  expect(await first).toEqual(manifest)
  expect(fetcher).toHaveBeenCalledOnce()
  expect(fetcher).toHaveBeenCalledWith("/sprites/sprites.json", expect.objectContaining({ cache: "no-cache" }))
})
it("continues after an unavailable or corrupt optional manifest", async () => {
  for (const response of [new Response("missing", { status: 404 }), Response.json({ residents: null })]) {
    vi.resetModules()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response),
    )
    const { spriteManifest } = await import("./assets")
    expect(await spriteManifest()).toBeNull()
  }
})
it("bounds fetch and JSON decoding, aborts the request, and does not restart it on every map", async () => {
  vi.useFakeTimers()
  let signal: AbortSignal | undefined
  let finishJson!: (value: unknown) => void
  const fetcher = vi.fn((_url: string, options: RequestInit) => {
    signal = options.signal as AbortSignal
    return Promise.resolve({
      ok: true,
      json: () =>
        new Promise((resolve) => {
          finishJson = resolve
        }),
    })
  })
  vi.stubGlobal("fetch", fetcher)
  const { spriteManifest } = await import("./assets")
  const result = spriteManifest()
  await vi.advanceTimersByTimeAsync(5000)
  expect(await result).toBeNull()
  expect(signal?.aborted).toBe(true)
  finishJson(manifest)
  await vi.advanceTimersByTimeAsync(0)
  expect(await spriteManifest()).toBeNull()
  expect(fetcher).toHaveBeenCalledOnce()
})
it("also bounds a request that never returns headers", async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  )
  const { spriteManifest } = await import("./assets")
  const result = spriteManifest()
  await vi.advanceTimersByTimeAsync(5000)
  expect(await result).toBeNull()
})
it("uses procedural images after a network rejection", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("offline")
    }),
  )
  const { spriteManifest } = await import("./assets")
  expect(await spriteManifest()).toBeNull()
})

it.each([undefined, SPRITE_RENDER_VERSION - 1, SPRITE_RENDER_VERSION + 1])("regenerates images from missing or incompatible renderer version %s", async (rendererVersion) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ ...manifest, rendererVersion })),
  )
  const assets = await import("./assets")
  expect(await assets.spriteManifest()).toBeNull()
})
