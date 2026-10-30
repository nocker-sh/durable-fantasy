import { expect, it } from "vitest"
import { workTableSections } from "./work-table"

it.each([0, 1.2, -2])("supports a complete tabletop on four separate legs from floor %s", (floor) => {
  const sections = workTableSections({ surface: { height: 0.74, thickness: 0.04, legWidth: 0.06, legInset: 0.3, kneeClearance: 0.18 }, x: 8, z: 12, width: 1.5, depth: 1, floor: floor })
  const tops = sections.filter((section) => section.part === "top"),
    legs = sections.filter((section) => section.part === "leg")
  expect(tops).toHaveLength(1)
  expect(legs).toHaveLength(4)
  const top = tops[0]
  expect(top.y1).toBeCloseTo(floor + 0.74)
  expect(top.y1 - top.y0).toBeCloseTo(0.04)
  for (const leg of legs) {
    expect(leg.y0).toBe(floor)
    expect(leg.y1).toBe(top.y0)
    expect(leg.x0).toBeGreaterThan(top.x0)
    expect(leg.x1).toBeLessThan(top.x1)
    expect(leg.z0).toBeGreaterThan(top.z0)
    expect(leg.z1).toBeLessThan(top.z1)
    expect(leg.x1 - leg.x0).toBeCloseTo(0.06)
    expect(leg.z1 - leg.z0).toBeCloseTo(0.06)
  }
  for (let i = 0; i < legs.length; i++)
    for (let j = i + 1; j < legs.length; j++) {
      const a = legs[i],
        b = legs[j]
      expect(a.x1 <= b.x0 || b.x1 <= a.x0 || a.z1 <= b.z0 || b.z1 <= a.z0).toBe(true)
    }
})
