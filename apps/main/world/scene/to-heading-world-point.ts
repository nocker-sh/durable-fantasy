import type { Point3 } from "#/lib/engine/cuboid-motion-types"

/** Match the actor's heading rotation before adding its root translation. */
export function toHeadingWorldPoint(point: Point3, origin: Point3, heading: number): Point3 {
  const cosine = Math.cos(heading),
    sine = Math.sin(heading)

  return [origin[0] + point[0] * cosine + point[2] * sine, origin[1] + point[1], origin[2] - point[0] * sine + point[2] * cosine]
}
