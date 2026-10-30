import type { Cuboid } from "./cuboid-subtraction"
import type { Point3 } from "./cuboid-motion-types"
export function translatedCuboid(relative: Cuboid, p: Point3): Cuboid {
  return { x0: relative.x0 + p[0], x1: relative.x1 + p[0], z0: relative.z0 + p[2], z1: relative.z1 + p[2], bottom: relative.bottom + p[1], top: relative.top + p[1] }
}
