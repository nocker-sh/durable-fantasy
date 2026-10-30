import type { Point3 } from "./cuboid-motion-types"
export type BoundedField = {
  min: Point3
  max: Point3
  value: (point: [number, number, number]) => number
  lipschitz: number
  level?: number
}
/** Proves that two closed sublevel sets are disjoint. Exhausted or uncertain cells return false. */
export function certifyFieldSeparation(a: BoundedField, b: BoundedField): boolean {
  for (const f of [a, b])
    if (!Number.isFinite(f.lipschitz) || f.lipschitz <= 0 || !Number.isFinite(f.level ?? 0) || [...f.min, ...f.max].some((v) => !Number.isFinite(v)) || f.min.some((v, i) => v > f.max[i]))
      throw new Error("Invalid bounded separation field")
  const min = a.min.map((v, i) => Math.max(v, b.min[i])),
    max = a.max.map((v, i) => Math.min(v, b.max[i]))
  if (min.some((v, i) => v > max[i])) return true
  const pending = [{ min, max, depth: 0 }]
  let cells = 0
  while (pending.length) {
    const cell = pending.pop()!,
      centre = cell.min.map((v, i) => (v + cell.max[i]) / 2) as [number, number, number],
      radius = Math.hypot(...cell.min.map((v, i) => (cell.max[i] - v) / 2)),
      av = a.value(centre),
      bv = b.value(centre)
    if (!Number.isFinite(av) || !Number.isFinite(bv)) return false
    if (av - a.lipschitz * radius > (a.level ?? 0) || bv - b.lipschitz * radius > (b.level ?? 0)) continue
    if ((av <= (a.level ?? 0) && bv <= (b.level ?? 0)) || cell.depth === 24 || ++cells > 8192) return false
    const sizes = cell.max.map((v, i) => v - cell.min[i]),
      axis = sizes.indexOf(Math.max(...sizes)),
      mid = centre[axis],
      left = [...cell.max],
      right = [...cell.min]
    left[axis] = mid
    right[axis] = mid
    pending.push({ min: right, max: cell.max, depth: cell.depth + 1 }, { min: cell.min, max: left, depth: cell.depth + 1 })
  }
  return true
}
