import type { Cuboid } from "./cuboid-subtraction"
import type { Point3 } from "./cuboid-motion-types"
/** Exact distance: between box-plane crossings, squared distance is one quadratic. */
export function segmentCuboidDistance(box: Cuboid, a: Point3, b: Point3): number {
  const low = [box.x0, box.bottom, box.z0],
    high = [box.x1, box.top, box.z1],
    delta = a.map((v, i) => b[i] - v),
    cuts = [0, 1]
  for (let i = 0; i < 3; i++)
    if (delta[i] !== 0)
      for (const plane of [low[i], high[i]]) {
        const t = (plane - a[i]) / delta[i]
        if (t > 0 && t < 1) cuts.push(t)
      }
  cuts.sort((a, b) => a - b)
  const squared = (t: number) => a.reduce((sum, v, i) => sum + Math.max(low[i] - v - delta[i] * t, v + delta[i] * t - high[i], 0) ** 2, 0)
  let best = Infinity
  for (let j = 1; j < cuts.length; j++) {
    const lo = cuts[j - 1],
      hi = cuts[j],
      middle = (lo + hi) / 2
    let linear = 0,
      quadratic = 0
    for (let i = 0; i < 3; i++) {
      const x = a[i] + delta[i] * middle,
        plane = x < low[i] ? low[i] : x > high[i] ? high[i] : undefined
      if (plane === undefined) continue
      linear += (a[i] - plane) * delta[i]
      quadratic += delta[i] ** 2
    }
    const t = quadratic ? Math.max(lo, Math.min(hi, -linear / quadratic)) : lo
    best = Math.min(best, squared(lo), squared(hi), squared(t))
  }
  return Math.sqrt(best)
}
