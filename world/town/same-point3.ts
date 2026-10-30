import type { Point3 } from "#/lib/engine/cuboid-motion-types"

export const samePoint3 = (a: Point3, b: Point3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1e-9
