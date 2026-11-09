import type { Q } from "#/lib/engine/quaternion-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
export type PouringPotPose = Readonly<{ at: Point3; rotation: Readonly<Q>; gripAt: Point3; lipAt: Point3 }>
