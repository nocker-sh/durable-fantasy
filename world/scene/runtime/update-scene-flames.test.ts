import { afterEach, expect, it } from "vitest"
import { PointLight } from "three"
import { fireLights } from "#/world/scene/construction/registry"
import { updateSceneFlames } from "#/world/scene/runtime/update-scene-flames"

afterEach(() => {
  fireLights.length = 0
})
it("distinguishes permanent and night fires and extinguishes unused rooms before either rule", () => {
  const lights = Array.from({ length: 3 }, () => new PointLight())
  fireLights.push({ light: lights[0], base: 2, seed: 0 }, { light: lights[1], base: -2, seed: 0 }, { light: lights[2], base: 2, seed: 0, room: { house: "room", floor: 1 } })
  const rooms = { isActive: () => false }
  updateSceneFlames(0, 0.5, rooms)
  expect(lights.map((light) => light.intensity)).toEqual([1.5, 0.75, 0])
  updateSceneFlames(0, 0, { isActive: () => true })
  expect(lights.map((light) => light.intensity)).toEqual([1.5, 0, 1.5])
})
