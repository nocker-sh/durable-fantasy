import { expect, it } from "vitest"
import { Color, Fog, Scene } from "three"
import { updateSceneSky } from "#/world/scene/runtime/update-scene-sky"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"

const world: SceneDefinition = { layout: SQUARE_LAYOUT, centre: [0, 0], build() {} }

it("uses the default outdoor fog and clears it under a roof", () => {
  const scene = new Scene()
  updateSceneSky({ scene, world: { ...world, layout: { ...world.layout, fog: undefined } }, sky: 0x9ec4d8, daylight: 1 })
  expect(scene.fog).toBeInstanceOf(Fog)
  expect(scene.fog).toMatchObject({ near: 30, far: 60 })
  expect(scene.background).toEqual(new Color(0x9ec4d8))
  updateSceneSky({ scene, world: { ...world, indoor: true }, sky: 0x9ec4d8, daylight: 1 })
  expect(scene.fog).toBeNull()
  expect(scene.background).toEqual(new Color(0x0c0a10))
})

it("keeps authored fog distances and gives the background an independent copy of its blended color", () => {
  const scene = new Scene()
  const fog = { color: 0, near: 3, far: 8 }
  updateSceneSky({ scene, world: { ...world, layout: { ...world.layout, fog } }, sky: 0xffffff, daylight: 1 })
  expect(scene.fog).toMatchObject({ near: 3, far: 8 })
  expect(scene.background).toEqual(new Color(0).lerp(new Color(0xffffff), 0.35))
  expect(scene.background).not.toBe(scene.fog?.color)
  expect(fog).toEqual({ color: 0, near: 3, far: 8 })
})
