import { expect, it } from "vitest"
import { flueCorbelParts } from "#/world/town/flue-corbel"
import { flueFloor } from "#/world/town/flue-floor"
const shaft = { x0: 2, z0: 2, x1: 2.5, z1: 2.5, wallThickness: 0.1, lowerFloor: 0, upperFloor: 1, floorCollar: 0.15, floorSupport: { depth: 0.2, steps: 4 } },
  bounds = { x0: 0, z0: 0, x1: 6, z1: 6 }
const area = (ps: readonly { x0: number; z0: number; x1: number; z1: number }[]) => ps.reduce((a, p) => a + (p.x1 - p.x0) * (p.z1 - p.z0), 0)
it("joins each step to its neighbour and matches the collar at the floor underside", () => {
  const ps = flueCorbelParts(shaft, 2.32, bounds)
  expect(ps).toHaveLength(16)
  for (let i = 0; i < 4; i++) {
    const layer = ps.slice(i * 4, i * 4 + 4),
      margin = (0.15 * (i + 1)) / 4
    expect(Math.min(...layer.map((p) => p.x0))).toBeCloseTo(2 - margin)
    expect(area(layer)).toBeCloseTo((0.5 + 2 * margin) ** 2 - 0.25)
    expect(layer.every((p) => p.x1 <= shaft.x0 || p.x0 >= shaft.x1 || p.z1 <= shaft.z0 || p.z0 >= shaft.z1)).toBe(true)
    expect(layer[0].bottom).toBeCloseTo(2.12 + 0.05 * i)
    expect(layer[0].top).toBeCloseTo(2.12 + 0.05 * (i + 1))
    if (i) expect(layer[0].bottom).toBe(ps[(i - 1) * 4].top)
  }
  expect(area(ps.slice(-4))).toBeCloseTo(area(flueFloor({ bounds: bounds, floor: 1, flues: [shaft], openings: [] }).stone))
})
it("clips masonry at the shell and rejects unsupported steep or malformed dimensions", () => {
  const edge = { ...shaft, x1: 6, x0: 5.5 }
  expect(flueCorbelParts(edge, 2.32, bounds).every((p) => p.x1 <= 6)).toBe(true)
  for (const floorSupport of [
    { depth: 0.1, steps: 4 },
    { depth: 0.2, steps: 0 },
    { depth: NaN, steps: 4 },
    { depth: 0.2, steps: 1.5 },
  ])
    expect(() => flueCorbelParts({ ...shaft, floorSupport }, 2.32, bounds)).toThrow("Invalid")
})
