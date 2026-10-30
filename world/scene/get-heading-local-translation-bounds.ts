import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = Readonly<{ box: Cuboid; from: Point3; to: Point3; heading: number }>

/** A fixed-heading straight root translation sweeps each obstacle between these local endpoints; their union encloses every intermediate position. */
export function getHeadingLocalTranslationBounds(props: Props): Cuboid | Error {
  const from = toHeadingLocalCuboid({ box: props.box, root: props.from, heading: props.heading }),
    to = toHeadingLocalCuboid({ box: props.box, root: props.to, heading: props.heading })
  if (from instanceof Error) return from
  if (to instanceof Error) return to
  const padding = 1e-12 * (1 + Math.max(...Object.values(from).map(Math.abs), ...Object.values(to).map(Math.abs)))
  const bounds = {
    x0: Math.min(from.x0, to.x0) - padding,
    x1: Math.max(from.x1, to.x1) + padding,
    z0: Math.min(from.z0, to.z0) - padding,
    z1: Math.max(from.z1, to.z1) + padding,
    bottom: Math.min(from.bottom, to.bottom) - padding,
    top: Math.max(from.top, to.top) + padding,
  }
  if (!Object.values(bounds).every(Number.isFinite)) return new Error("Unbounded local translation enclosure")

  return bounds
}
