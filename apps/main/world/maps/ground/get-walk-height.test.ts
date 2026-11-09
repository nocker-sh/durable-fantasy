import { expect, it, vi } from "vitest"
import { getWalkHeight } from "#/world/maps/ground/get-walk-height"

const bridge = { x0: 10, z0: 20, x1: 14, z1: 24 }
it("selects the highest registered surface without lowering ground or bridge height", () => {
  const groundHeight = () => 2,
    surfaces = [{ rect: [10, 20, 14, 24] satisfies readonly [number, number, number, number], height: 7 }]
  expect(getWalkHeight({ x: 12, z: 22, bridge, groundHeight, surfaces })).toBe(7)
  expect(getWalkHeight({ x: 12, z: 22, bridge, groundHeight, surfaces: [{ ...surfaces[0], height: 1 }] })).toBeCloseTo(2.39, 12)
})
it.each([
  { x: 1, z: 1, expected: 3 },
  { x: 3, z: 1, expected: 2 },
  { x: 1, z: 3, expected: 2 },
  { x: 0.9, z: 1, expected: 2 },
])("retains half-open surface boundaries at $x,$z", (input) => {
  expect(getWalkHeight({ x: input.x, z: input.z, bridge, groundHeight: () => 2, surfaces: [{ rect: [1, 1, 3, 3], height: 3 }] })).toBe(input.expected)
})
it("samples ground once outside the bridge and does not mutate surface definitions", () => {
  const groundHeight = vi.fn(() => 2),
    surfaces = [{ rect: [1, 1, 3, 3] satisfies readonly [number, number, number, number], height: 1 }],
    before = structuredClone(surfaces)
  expect(getWalkHeight({ x: 2, z: 2, bridge, groundHeight, surfaces })).toBe(2)
  expect(groundHeight).toHaveBeenCalledExactlyOnceWith(2, 2)
  expect(surfaces).toEqual(before)
})
