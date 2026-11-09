import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Readonly<{ capsules: readonly Readonly<{ a: Point3; b: Point3; r: number }>[]; margin: number; rootY: number; ceiling: number; boxes: readonly Cuboid[] }>

/** A whole moving segment stays in its midpoint capsule enlarged by the maximum endpoint displacement. */
export function getNativeLegCapsuleExternalError(props: Props): Error | null {
  if (![props.margin, props.rootY, props.ceiling].every(Number.isFinite) || props.margin < 0 || props.ceiling <= 0) return new Error("Invalid native leg capsule interval")
  if (props.boxes.some((box) => ![box.x0, box.x1, box.z0, box.z1, box.bottom, box.top].every(Number.isFinite) || box.x0 >= box.x1 || box.z0 >= box.z1 || box.bottom >= box.top))
    return new Error("Invalid native leg capsule obstacle")
  if (!props.capsules.length) return new Error("Native leg surface has no control-point enclosure")

  for (const capsule of props.capsules) {
    if (![...capsule.a, ...capsule.b, capsule.r].every(Number.isFinite) || capsule.r <= 0) return new Error("Invalid native leg surface enclosure")
    if (Math.min(capsule.a[1], capsule.b[1]) - capsule.r - props.margin + props.rootY < -1e-9 || Math.max(capsule.a[1], capsule.b[1]) + capsule.r + props.margin + props.rootY > props.ceiling)
      return new Error("Native leg interval leaves its floor or ceiling")
    if (props.boxes.some((box) => segmentCuboidDistance(box, capsule.a, capsule.b) < capsule.r + props.margin)) return new Error("Native leg interval clearance from a solid remains unresolved")
  }

  return null
}
