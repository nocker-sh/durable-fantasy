import type { Cuboid } from "./cuboid-subtraction"

/** Axis-aligned expansion encloses every displacement of at most the given Euclidean distance. */
export function getExpandedCuboid(box: Cuboid, margin: number): Cuboid | Error {
  if (![box.x0, box.x1, box.bottom, box.top, box.z0, box.z1, margin].every(Number.isFinite) || margin < 0 || box.x0 >= box.x1 || box.bottom >= box.top || box.z0 >= box.z1)
    return new Error("Invalid cuboid expansion")
  const expanded = { x0: box.x0 - margin, x1: box.x1 + margin, bottom: box.bottom - margin, top: box.top + margin, z0: box.z0 - margin, z1: box.z1 + margin }
  if (!Object.values(expanded).every(Number.isFinite)) return new Error("Cuboid expansion exceeds finite space")

  return expanded
}
