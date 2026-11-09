import { expect, it } from "vitest"
import { MeshLambertMaterial, PointLight } from "three"
import { updateSceneLamps } from "#/world/scene/runtime/update-scene-lamps"

it("uses the guard's ordered index for staggered lighting and the lamp's location for flicker", () => {
  const lamps = [0, 1, 2].map((x) => ({ x, z: 0, light: new PointLight(), glow: new MeshLambertMaterial() }))
  updateSceneLamps(lamps, 1000, 0)
  expect(lamps.map((lamp) => lamp.glow.emissiveIntensity)).toEqual([1.6, 0, 0])
  expect(lamps[0].light.intensity).toBe(1.9 * 0.85)
  updateSceneLamps(lamps, 720, 0)
  expect(lamps.map((lamp) => lamp.light.intensity)).toEqual([0, 0, 0])
  for (const lamp of lamps) lamp.glow.dispose()
})
