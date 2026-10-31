import { expect, it, vi } from "vitest"
import { Vector3 } from "three"
import { updateSceneSmoke } from "#/world/scene/runtime/update-scene-smoke"

it("keeps puff order, lifetime boundary, origin and the existing single-wrap phase", () => {
  const origins = [new Vector3(2, 3, 4), new Vector3(5, 6, 7)]
  const puffs = [
    { age: 4, life: 4.5, origin: origins[0], driftX: 0.2 },
    { age: 4.4, life: 4.5, origin: origins[1], driftX: 0.3 },
  ]
  const smoke = { set: vi.fn() }
  updateSceneSmoke({ environment: { puffs, smoke }, dt: 0.5 })
  expect(puffs[0].age).toBe(4.5)
  expect(puffs[1].age).toBeCloseTo(0.4)
  expect(smoke.set.mock.calls[0][0]).toEqual({ index: 0, x: 2 + 1.6 * 0.2 * 6 + Math.sin(11) * 0.08, y: 5.6, z: 3.4, size: expect.closeTo(0.68, 14), opacity: 0 })
  expect(smoke.set.mock.calls[1][0]).toMatchObject({ index: 1 })
  expect(puffs.map((puff) => puff.origin)).toEqual(origins)
  updateSceneSmoke({ environment: { puffs, smoke }, dt: 10 })
  expect(puffs[0].age).toBe(10)
})
