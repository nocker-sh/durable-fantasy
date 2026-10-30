import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"

/** Invert the actor's translation and heading before solving native joints. */
export function toHeadingLocalPoint(point: Point3, origin: Point3, heading: number): Point3 {
  return toHeadingWorldPoint([point[0] - origin[0], point[1] - origin[1], point[2] - origin[2]], [0, 0, 0], -heading)
}
