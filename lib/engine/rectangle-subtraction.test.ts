import { expect, it } from "vitest"
import { subtractRectangles } from "./rectangle-subtraction"
it("removes intersecting openings without overlapping or losing the remaining floor", () => {
  const source = { x0: 0, z0: 0, x1: 10, z1: 8 },
    cuts = [
      { x0: 1, z0: 1, x1: 3, z1: 5 },
      { x0: 2, z0: 3, x1: 4, z1: 6 },
    ]
  const parts = subtractRectangles(source, cuts)
  const area = parts.reduce((sum, p) => sum + (p.x1 - p.x0) * (p.z1 - p.z0), 0)
  expect(area).toBe(80 - 8 - 6 + 2)
  for (const [i, a] of parts.entries()) {
    expect(a.x0 >= source.x0 && a.x1 <= source.x1 && a.z0 >= source.z0 && a.z1 <= source.z1).toBe(true)
    for (const b of [...parts.slice(i + 1), ...cuts]) expect(Math.min(a.x1, b.x1) <= Math.max(a.x0, b.x0) || Math.min(a.z1, b.z1) <= Math.max(a.z0, b.z0)).toBe(true)
  }
})
it("clips a cut at the edge and preserves a floor untouched by an outside cut", () => {
  const source = { x0: 0, z0: 0, x1: 2, z1: 2 }
  expect(subtractRectangles(source, [{ x0: 2, z0: 0, x1: 3, z1: 2 }])).toEqual([source])
  expect(subtractRectangles(source, [{ x0: -1, z0: -1, x1: 1, z1: 3 }])).toEqual([{ x0: 1, z0: 0, x1: 2, z1: 2 }])
})
