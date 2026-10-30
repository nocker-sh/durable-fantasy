import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = Readonly<{ box: Cuboid; root: Point3; heading: number }>

/** Enclose every corner of a real vertical wooden bar in the same grounded frame as the native palm. */
export function getVerticalCuboidGripBar(props: Props): RoundGripBar | Error {
  const box = toHeadingLocalCuboid(props)
  if (box instanceof Error) return box
  if (box.top - box.bottom <= Math.max(box.x1 - box.x0, box.z1 - box.z0)) return new Error("Grip bar has no vertical wooden axis")
  const x = (box.x0 + box.x1) / 2,
    z = (box.z0 + box.z1) / 2

  return { from: [x, box.bottom, z], to: [x, box.top, z], radius: Math.hypot((box.x1 - box.x0) / 2, (box.z1 - box.z0) / 2) }
}
