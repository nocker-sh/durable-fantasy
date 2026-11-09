import { expect, it, vi } from "vitest"
import { getGroundRimHeight } from "#/world/maps/get-ground-rim-height"
import { withRimmedLayout } from "#/world/maps/with-rimmed-layout"
import { INDOOR } from "#/world/maps/layouts/indoor"

it("raises closed edges, leaves the interior flat and keeps every declared side open", () => {
  const centre = { x: 24, z: 24, h: 3, roadD: 0 }
  expect(getGroundRimHeight(centre, "")).toBe(0)
  for (const point of [
    { x: 0, z: 24, side: "w" },
    { x: 48, z: 24, side: "e" },
    { x: 24, z: 0, side: "n" },
    { x: 24, z: 48, side: "s" },
  ]) {
    const input = { ...centre, x: point.x, z: point.z }
    expect(getGroundRimHeight(input, "")).toBeGreaterThan(0)
    expect(getGroundRimHeight(input, point.side)).toBe(0)
    expect(getGroundRimHeight(input, "wnes")).toBe(0)
  }
})

it("preserves the inner shape without mutating or replacing the original layout", () => {
  const shape = vi.fn(() => 7)
  const source = { ...INDOOR, shape }
  const before = { ...source }
  const wrapped = withRimmedLayout(source, "wnes")
  const input = { x: 2, z: 3, h: 4, roadD: 5 }
  expect(wrapped.shape?.(input)).toBe(7)
  expect(shape).toHaveBeenCalledExactlyOnceWith(input)
  expect(source).toEqual(before)
  expect(wrapped).not.toBe(source)
  expect(withRimmedLayout(INDOOR, "wnes").shape?.(input)).toBe(4)
})
