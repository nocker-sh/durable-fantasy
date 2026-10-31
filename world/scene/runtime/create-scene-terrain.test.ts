import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { BufferGeometry, Material, Mesh, Texture } from "three"
import { createSceneTerrain } from "#/world/scene/runtime/create-scene-terrain"
import { createSceneRoot } from "#/world/scene/runtime/create-scene-root"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { withCleanup } from "#/lib/engine/with-cleanup"
import { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import { INTERIORS } from "#/world/town/interiors"
import { F, fieldsReady, N } from "#/world/scene/world"

beforeEach(() => {
  fieldsReady.value = true
  F.h.fill(0)
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
  vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => ({ putImageData() {}, fillStyle: "", fillRect() {} }) }) })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  fieldsReady.value = false
})

function fixture() {
  const resources = new CleanupStack()
  const scene = createSceneRoot(resources)
  return { scene, resources, world: MAP_SCENES.phanthiet, ground: new PixelBuffer(2, 2), progress: vi.fn(), tick: vi.fn(async () => {}) }
}

it("adds terrain before water and leaves their real geometry and animation material connected", async () => {
  const f = fixture()
  const terrain = await createSceneTerrain(f)
  expect(f.scene.children[0]).toBe(terrain.terrain)
  const water = f.scene.children[1]
  if (!(water instanceof Mesh)) throw Error("Missing water mesh")
  expect(water.material).toBe(terrain.wm)
  expect(terrain.terrain.geometry.getAttribute("position").count).toBe((N * 4 + 1) ** 2)
  expect(terrain.terrain.geometry.getIndex()?.count).toBe((N * 4) ** 2 * 6)
  expect(Array.from(terrain.terrain.geometry.getAttribute("normal").array.slice(0, 3))).toEqual([0, 1, 0])
  expect(terrain.terrain.receiveShadow && terrain.terrain.castShadow).toBe(true)
  expect(terrain.terrain.visible && water.visible).toBe(true)
  expect(f.progress).toHaveBeenCalledExactlyOnceWith("街を建てています…")
  expect(f.tick).toHaveBeenCalledOnce()
  f.resources.dispose()
})

it("keeps the indoor minimap but hides the outdoor terrain and water", async () => {
  const f = fixture()
  const world = MAP_SCENES[INTERIORS[0].id]
  const terrain = await createSceneTerrain({ ...f, world })
  expect(terrain.groundCanvas.width).toBe(2)
  expect(f.scene.children.every((object) => !object.visible)).toBe(true)
  f.resources.dispose()
})

it("keeps GPU surface construction after the asynchronous loading yield", async () => {
  const f = fixture()
  const gate = { resolve: () => {} }
  const pause = new Promise<void>((resolve) => {
    gate.resolve = resolve
  })
  const pending = createSceneTerrain({ ...f, tick: () => pause })
  expect(f.scene.children).toEqual([])
  expect(f.progress).toHaveBeenCalledOnce()
  gate.resolve()
  await pending
  expect(f.scene.children).toHaveLength(2)
  f.resources.dispose()
})

it("releases both geometries, both materials and shader-only textures if adding water fails", async () => {
  const geometries = vi.spyOn(BufferGeometry.prototype, "dispose")
  const materials = vi.spyOn(Material.prototype, "dispose")
  const textures = vi.spyOn(Texture.prototype, "dispose")
  const failure = Error("water attachment failed")
  await expect(
    withCleanup(async (resources) => {
      const scene = createSceneRoot(resources)
      const add = scene.add.bind(scene)
      vi.spyOn(scene, "add")
        .mockImplementationOnce((...objects) => add(...objects))
        .mockImplementationOnce(() => {
          throw failure
        })
      return createSceneTerrain({ scene, resources, world: MAP_SCENES.phanthiet, ground: new PixelBuffer(2, 2), progress() {}, tick: async () => {} })
    }),
  ).rejects.toThrow(failure)
  expect(geometries).toHaveBeenCalledTimes(2)
  expect(materials).toHaveBeenCalledTimes(2)
  expect(textures).toHaveBeenCalledTimes(2)
})
