import { afterEach, expect, it, vi } from "vitest"
import type { SceneOptions } from "#/world/scene/runtime/scene-options"
import type { SceneEvents } from "#/world/scene/runtime/types"
const factory = vi.hoisted(() => ({ create: vi.fn<(map: string, progress: (text: string) => void, input: { signal: AbortSignal; options: SceneOptions }) => Promise<unknown>>() }))
vi.mock("#/world/scene/runtime/create-scene-runtime", () => ({ createSceneRuntime: factory.create }))
vi.mock("../world", () => ({ N: 96, WR: 2, WN: 96, blocked: vi.fn() }))
vi.mock("#/world/scene/construction/registry", () => ({ places: {} }))
vi.mock("#/world/lap", () => ({ lap: vi.fn() }))
vi.mock("#/world/scene/key-turn", () => ({ keyTurn: vi.fn() }))
import { MapScene } from "#/world/scene/runtime/scene"
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
function fixture() {
  const callbacks = { resolve: (_runtime: unknown) => {}, reject: (_error: Error) => {}, progress: (_text: string) => {} }
  const result = new Promise<unknown>((resolve, reject) => {
    callbacks.resolve = resolve
    callbacks.reject = reject
  })
  factory.create.mockImplementation((_map, progress) => {
    callbacks.progress = progress
    return result
  })
  const element = { style: {}, remove: vi.fn() }
  const parent = { style: {}, appendChild: vi.fn(), clientWidth: 320, clientHeight: 240 }
  vi.stubGlobal("document", { createElement: (tag: string) => (tag === "main" ? parent : element) })
  vi.stubGlobal("getComputedStyle", () => ({ position: "relative" }))
  const events: SceneEvents = { progress: vi.fn(), failed: vi.fn(), ready: vi.fn(), walk: vi.fn(), reach: vi.fn(), gatherAt: vi.fn(), stationAt: vi.fn(), swing: vi.fn(), tick: vi.fn() }
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn()
      disconnect = vi.fn()
    },
  )
  const scene = new MapScene({ element: document.createElement("main"), events })
  const call = factory.create.mock.calls.at(-1)
  if (!call) throw new Error("Scene construction did not start")
  return { scene, layer: element, events, result, resolve: callbacks.resolve, reject: callbacks.reject, signal: call[2].signal, progress: (text: string) => callbacks.progress(text) }
}
it("does not publish progress or failure after leaving a still-loading map", async () => {
  const f = fixture()
  f.progress("地面")
  expect(f.events.progress).toHaveBeenCalledOnce()
  expect(f.signal.aborted).toBe(false)
  f.scene.destroy()
  expect(f.signal.aborted).toBe(true)
  f.progress("前のマップの住民")
  f.reject(new Error("old map failed"))
  await f.result.catch(() => {})
  expect(f.events.progress).toHaveBeenCalledOnce()
  expect(f.events.failed).not.toHaveBeenCalled()
  expect(f.events.ready).not.toHaveBeenCalled()
})
it("still reports a failure in the current map", async () => {
  const f = fixture(),
    error = new Error("current map failed")
  f.reject(error)
  await f.result.catch(() => {})
  expect(f.events.failed).toHaveBeenCalledWith(error)
  f.scene.destroy()
})
it("disposes a scene that finishes after its owner has left", async () => {
  const f = fixture(),
    dispose = vi.fn()
  f.scene.destroy()
  f.resolve({ dispose })
  await f.result
  expect(dispose).toHaveBeenCalledOnce()
  expect(f.events.ready).not.toHaveBeenCalled()
})

it("removes the DOM layer even if releasing the attached runtime fails", async () => {
  const f = fixture(),
    dispose = vi.fn(() => {
      throw new Error("GPU cleanup failed")
    })
  f.resolve({ dispose, renderer: { domElement: { remove: vi.fn() } }, setLayer: vi.fn(), resize: vi.fn(), start: vi.fn() })
  await f.result
  expect(f.scene.ready).toBe(true)
  expect(() => f.scene.destroy()).toThrow("GPU cleanup failed")
  expect(f.layer.remove).toHaveBeenCalledOnce()
  expect(f.scene.ready).toBe(false)
  f.scene.destroy()
  expect(dispose).toHaveBeenCalledOnce()
})

it("releases an attached runtime and reports failure when starting the frame loop throws", async () => {
  const request = fixture()
  const failure = new Error("frame loop failed")
  const runtime = {
    dispose: vi.fn(),
    renderer: { domElement: { remove: vi.fn() } },
    setLayer: vi.fn(),
    resize: vi.fn(),
    start: vi.fn(() => {
      throw failure
    }),
    running: false,
    events: request.events,
  }
  request.resolve(runtime)
  await request.result
  await vi.waitFor(() => expect(request.events.failed).toHaveBeenCalledWith(failure), { timeout: 100 })
  expect(request.events.ready).not.toHaveBeenCalled()
  expect(request.scene.ready).toBe(false)
  expect(runtime.running).toBe(false)
  expect(runtime.events).toBeNull()
  expect(runtime.dispose).toHaveBeenCalledOnce()
  expect(runtime.renderer.domElement.remove).toHaveBeenCalledOnce()
  expect(request.layer.remove).toHaveBeenCalledOnce()
  request.scene.destroy()
  expect(runtime.dispose).toHaveBeenCalledOnce()
})

it("reports both attachment and cleanup failures without retaining a ready runtime", async () => {
  const request = fixture()
  const startError = new Error("start failed")
  const cleanupError = new Error("cleanup failed")
  const dispose = vi.fn(() => {
    throw cleanupError
  })
  request.resolve({
    dispose,
    renderer: { domElement: { remove: vi.fn() } },
    setLayer: vi.fn(),
    resize: vi.fn(),
    start: () => {
      throw startError
    },
  })
  await request.result
  expect(request.events.failed).toHaveBeenCalledOnce()
  const error = vi.mocked(request.events.failed)?.mock.calls[0]?.[0]
  expect(error).toBeInstanceOf(AggregateError)
  if (error instanceof AggregateError) expect(error.errors).toEqual([startError, cleanupError])
  expect(request.scene.ready).toBe(false)
  expect(request.layer.remove).toHaveBeenCalledOnce()
  request.scene.destroy()
  expect(dispose).toHaveBeenCalledOnce()
})
