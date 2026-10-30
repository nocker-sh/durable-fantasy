import { expect, it } from "vitest"
import { gableRoofPanels } from "./gable-roof-panels"
import { gableRoofHeight } from "./gable-roof-height"
import { type GableRoof } from "./gable-roof-types"
it("keeps both roof slopes planar and upward around a penetration crossing the ridge", () => {
  for (const ridgeAxis of ["x", "z"] as const) {
    const roof: GableRoof = { bounds: { x0: 1, z0: 2, x1: 7, z1: 10 }, eave: 4, ridge: 6, ridgeAxis, overhang: 0.25 }
    const cut = { x0: 3.5, z0: 5.5, x1: 4.5, z1: 6.5 },
      panels = gableRoofPanels(roof, [cut])
    let area = 0
    for (const [a, b, c, d] of panels) {
      area += Math.abs((b[0] - a[0]) * (d[2] - a[2]) - (b[2] - a[2]) * (d[0] - a[0]))
      expect((b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2])).toBeGreaterThan(0)
      for (const p of [a, b, c, d]) expect(p[1]).toBeCloseTo(gableRoofHeight(roof, p[0], p[2]))
      const [x, z] = [(a[0] + c[0]) / 2, (a[2] + c[2]) / 2]
      expect(x > cut.x0 && x < cut.x1 && z > cut.z0 && z < cut.z1).toBe(false)
    }
    expect(area).toBeCloseTo(6.5 * 8.5 - 1)
    expect(gableRoofHeight(roof, 4, 6)).toBe(6)
    expect(gableRoofHeight(roof, ridgeAxis === "z" ? 0.75 : 4, ridgeAxis === "x" ? 1.75 : 6)).toBeLessThan(4)
  }
})
