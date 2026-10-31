import { expect, it, vi } from "vitest"
import { getBridgeDeckHeight } from "#/world/maps/ground/get-bridge-deck-height"

it("samples the actual bridge's banks at its centreline instead of a fixed map coordinate", () => {
  const groundHeight = vi.fn((_x: number, z: number) => z),
    bridge = { x0: 10, x1: 14, z0: 100, z1: 102 }
  expect(getBridgeDeckHeight({ x: 12, bridge, groundHeight })).toBeCloseTo(101.39, 12)
  expect(groundHeight.mock.calls).toEqual([
    [9.8, 101],
    [14.2, 101],
  ])
})
it("retains both bank levels and the arch between them", () => {
  const bridge = { x0: 10, x1: 14, z0: 20, z1: 24 },
    groundHeight = (x: number, z: number) => x + 2 * z
  expect(getBridgeDeckHeight({ x: 10, bridge, groundHeight })).toBeCloseTo(53.84, 12)
  expect(getBridgeDeckHeight({ x: 12, bridge, groundHeight })).toBeCloseTo(56.39, 12)
  expect(getBridgeDeckHeight({ x: 14, bridge, groundHeight })).toBeCloseTo(58.24, 12)
})
