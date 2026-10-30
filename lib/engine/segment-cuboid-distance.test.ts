import { expect, it } from "vitest"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
const box = { x0: 0, x1: 1, bottom: 0, top: 1, z0: 0, z1: 1 }
it("finds interior crossings, touching faces and stationary distances", () => {
  expect(segmentCuboidDistance(box, [-2, 0.5, 0.5], [3, 0.5, 0.5])).toBe(0)
  expect(segmentCuboidDistance(box, [-2, 1, 0.5], [3, 1, 0.5])).toBe(0)
  expect(segmentCuboidDistance(box, [2, 3, 4], [2, 3, 4])).toBeCloseTo(Math.sqrt(14), 12)
})
it("finds an interior closest point between disjoint endpoints", () => {
  expect(segmentCuboidDistance(box, [-2, 2, 0.5], [3, 2, 0.5])).toBeCloseTo(1, 12)
  expect(segmentCuboidDistance(box, [-2, 3, 2], [3, -2, 2])).toBeCloseTo(1, 12)
  expect(segmentCuboidDistance(box, [-2, 5, 2], [5, -2, 2])).toBeCloseTo(Math.sqrt(1.5), 12)
})
it("preserves reversal and agrees with an independently sampled upper bound", () => {
  for (let i = 0; i < 30; i++) {
    const a: [number, number, number] = [Math.sin(i) * 3, Math.cos(i * 2) * 3, Math.sin(i * 3) * 3],
      b: [number, number, number] = [Math.cos(i) * 3, Math.sin(i * 2) * 3, Math.cos(i * 3) * 3],
      exact = segmentCuboidDistance(box, a, b)
    let sampled = Infinity
    for (let j = 0; j <= 1000; j++) {
      const p = a.map((v, k) => v + ((b[k] - v) * j) / 1000)
      sampled = Math.min(sampled, Math.hypot(...p.map((v) => Math.max(-v, v - 1, 0))))
    }
    expect(exact).toBeCloseTo(segmentCuboidDistance(box, b, a), 12)
    expect(exact).toBeLessThanOrEqual(sampled + 1e-12)
    expect(sampled - exact).toBeLessThan(0.01)
  }
})
