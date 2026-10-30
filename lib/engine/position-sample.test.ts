import { expect, it, vi } from "vitest"
import { PositionSample } from "#/lib/engine/position-sample"

it("samples stationary positions once and updates either coordinate without rounding", () => {
  const terrain = vi.fn((x: number, z: number) => x * 2 - z)
  const height = new PositionSample(terrain)
  for (let frame = 0; frame < 600; frame++) expect(height.at(4, 3)).toBe(5)
  expect(terrain).toHaveBeenCalledTimes(1)
  expect(height.at(4.001, 3)).toBeCloseTo(5.002)
  expect(height.at(4.001, 3.001)).toBeCloseTo(5.001)
  expect(height.at(4, 3)).toBe(5)
  expect(terrain).toHaveBeenCalledTimes(4)
})

it("keeps fields independent and retries a failed sample", () => {
  const terrain = vi
    .fn()
    .mockImplementationOnce(() => {
      throw Error("not ready")
    })
    .mockReturnValue(7)
  const height = new PositionSample(terrain)
  expect(() => height.at(0, 0)).toThrow("not ready")
  expect(height.at(0, 0)).toBe(7)
  expect(height.at(0, 0)).toBe(7)
  expect(terrain).toHaveBeenCalledTimes(2)
  expect(new PositionSample(() => -2).at(0, 0)).toBe(-2)
})
