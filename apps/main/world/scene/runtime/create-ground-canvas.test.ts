import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { createGroundCanvas } from "#/world/scene/runtime/create-ground-canvas"
import { paintInteriorMinimap } from "#/world/scene/runtime/paint-interior-minimap"
import { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"

const registry = vi.hoisted(() => {
  const scenes: Record<string, SceneDefinition> = {}
  const interiors: { id: string }[] = []
  return { scenes, interiors }
})
vi.mock("#/world/scene/runtime/definitions", () => ({ MAP_SCENES: registry.scenes }))
vi.mock("#/world/town/interiors", () => ({ INTERIORS: registry.interiors }))
vi.mock("#/world/scene/runtime/paint-interior-minimap", () => ({ paintInteriorMinimap: vi.fn() }))
beforeEach(() => {
  registry.interiors.length = 0
  for (const id of Object.keys(registry.scenes)) delete registry.scenes[id]
  vi.stubGlobal(
    "ImageData",
    class {
      constructor(
        readonly data: Uint8ClampedArray,
        readonly width: number,
        readonly height: number,
      ) {}
    },
  )
})
afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

function fixture() {
  const context = { putImageData: vi.fn() }
  const canvas = { width: 0, height: 0, getContext: vi.fn<() => typeof context | null>(() => context) }
  vi.stubGlobal("document", { createElement: () => canvas })
  const world: SceneDefinition = { layout: SQUARE_LAYOUT, build() {}, centre: [0, 0] }
  const ground = new PixelBuffer(2, 3)
  return { canvas, context, world, ground }
}

it("copies the same ground pixels and dimensions without changing an outdoor map", () => {
  const f = fixture()
  const canvas = createGroundCanvas(f.ground, f.world)
  expect(canvas).toBe(f.canvas)
  expect([canvas.width, canvas.height]).toEqual([2, 3])
  expect(f.context.putImageData).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ data: f.ground.data, width: 2, height: 3 }), 0, 0)
  expect(paintInteriorMinimap).not.toHaveBeenCalled()
})

it("selects the indoor minimap by the exact registered scene definition", () => {
  const f = fixture()
  f.world.indoor = true
  const room = { id: "room" }
  registry.interiors.push({ id: "other" }, room)
  registry.scenes.room = f.world
  createGroundCanvas(f.ground, f.world)
  expect(paintInteriorMinimap).toHaveBeenCalledExactlyOnceWith(f.context, f.ground, room)
})

it("reports an unavailable canvas context before trying to transfer pixels", () => {
  const f = fixture()
  f.canvas.getContext.mockReturnValue(null)
  expect(() => createGroundCanvas(f.ground, f.world)).toThrow("Canvas 2D context unavailable")
  expect(f.context.putImageData).not.toHaveBeenCalled()
})

it("does not paint a different room when an indoor definition is unregistered", () => {
  const f = fixture()
  f.world.indoor = true
  registry.interiors.push({ id: "other" })
  registry.scenes.other = { ...f.world }
  expect(() => createGroundCanvas(f.ground, f.world)).toThrow("Missing indoor minimap definition")
  expect(paintInteriorMinimap).not.toHaveBeenCalled()
})
