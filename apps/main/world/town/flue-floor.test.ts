import { expect, it } from "vitest"
import { flueFloor } from "#/world/town/flue-floor"
const bounds = { x0: 0, z0: 0, x1: 8, z1: 9 },
  shaft = { x0: 5.5, z0: 8, x1: 6, z1: 8.5, wallThickness: 0.1, lowerFloor: 0, upperFloor: 1, floorCollar: 0.15, floorSupport: { depth: 0.2, steps: 4 } }
const area = (rs: readonly (typeof bounds)[]) => rs.reduce((a, r) => a + (r.x1 - r.x0) * (r.z1 - r.z0), 0)
const at = (rs: readonly (typeof bounds)[], x: number, z: number) => rs.some((r) => r.x0 < x && r.x1 > x && r.z0 < z && r.z1 > z)
it("replaces the timber around the shaft with a continuous stone collar", () => {
  const p = flueFloor({ bounds: bounds, floor: 1, flues: [shaft], openings: [] })
  expect(at(p.timber, 5.4, 8.2)).toBe(false)
  expect(at(p.stone, 5.4, 8.2)).toBe(true)
  expect(at(p.stone, 5.7, 8.2)).toBe(false)
  expect(area(p.timber) + area(p.stone)).toBeCloseTo(72 - 0.25)
  expect(area(p.stone)).toBeCloseTo(0.8 * 0.8 - 0.25)
  expect(flueFloor({ bounds: bounds, floor: 0, flues: [shaft], openings: [] })).toEqual({ timber: [bounds], stone: [] })
})
it("clips collars at the shell and leaves stair openings unobstructed", () => {
  const opening = { x0: 5.3, z0: 7.7, x1: 5.6, z1: 8.7 }
  const p = flueFloor({ bounds: bounds, floor: 1, flues: [shaft, { ...shaft, x0: 7.5, x1: 8 }], openings: [opening] })
  expect(at(p.stone, 5.4, 8.2)).toBe(false)
  expect([...p.stone, ...p.timber].every((r) => r.x0 >= 0 && r.x1 <= 8 && r.z0 >= 0 && r.z1 <= 9)).toBe(true)
  expect(() => flueFloor({ bounds: bounds, floor: 1, flues: [{ ...shaft, floorCollar: 0 }], openings: [] })).toThrow("positive")
})
