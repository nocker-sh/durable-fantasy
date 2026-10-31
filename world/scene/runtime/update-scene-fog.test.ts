import { expect, it } from "vitest"
import { Fog, FogExp2, Scene } from "three"
import { updateSceneFog } from "#/world/scene/runtime/update-scene-fog"

it("measures the configured fog from the player and replaces distances after zoom", () => {
  const scene = new Scene()
  const fog = new Fog(0xabcdef, 1, 2)
  scene.fog = fog
  const definition = { color: 0, near: 4, far: 18 }
  updateSceneFog({ scene, distance: 13, definition })
  expect([fog.near, fog.far]).toEqual([17, 31])
  updateSceneFog({ scene, distance: 7, definition })
  expect([fog.near, fog.far]).toEqual([11, 25])
  expect(scene.fog).toBe(fog)
  expect(fog.color.getHex()).toBe(0xabcdef)
  expect(definition).toEqual({ color: 0, near: 4, far: 18 })
})

it("leaves default fog and absent fog alone when no range is authored", () => {
  const scene = new Scene()
  const fog = new Fog(0, 30, 60)
  scene.fog = fog
  updateSceneFog({ scene, distance: 13, definition: undefined })
  expect([fog.near, fog.far]).toEqual([30, 60])
  scene.fog = null
  updateSceneFog({ scene, distance: 13, definition: { color: 0, near: 4, far: 18 } })
  expect(scene.fog).toBeNull()
})

it("does not change exponential fog", () => {
  const scene = new Scene()
  const fog = new FogExp2(0x123456, 0.03)
  scene.fog = fog
  updateSceneFog({ scene, distance: 13, definition: { color: 0, near: 4, far: 18 } })
  expect(scene.fog).toBe(fog)
  expect(fog.density).toBe(0.03)
})
