import { afterEach, expect, it, vi } from "vitest"
import type { SceneEvents } from "#/world/scene/runtime/types"
const factory = vi.hoisted(() => ({ create: vi.fn() }))
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
  let resolve!: (runtime: unknown) => void, reject!: (error: Error) => void, progress!: (text: string) => void
  const result = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  factory.create.mockImplementation((_map: string, notify: typeof progress) => {
    progress = notify
    return result
  })
  const element = { style: {}, remove: vi.fn() }
  vi.stubGlobal("document", { createElement: () => element })
  vi.stubGlobal("getComputedStyle", () => ({ position: "relative" }))
  const events: SceneEvents = { progress: vi.fn(), failed: vi.fn(), ready: vi.fn(), walk: vi.fn(), reach: vi.fn(), gatherAt: vi.fn(), stationAt: vi.fn(), swing: vi.fn(), tick: vi.fn() }
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn()
      disconnect = vi.fn()
    },
  )
  const scene = new MapScene({ element: { style: {}, appendChild: vi.fn(), clientWidth: 320, clientHeight: 240 } as unknown as HTMLElement, events: events })
  return { scene, layer: element, events, result, resolve, reject, signal: factory.create.mock.calls.at(-1)![2].signal as AbortSignal, progress: (text: string) => progress(text) }
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
