import type { StorageBoxBounds } from "#/world/town/storage-box-types"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = { box: StorageBoxBounds; rest: Point3; support: Cuboid | null }

/** The whole loose board must rest on a real top surface; a nonzero height cannot stand in for missing furniture. */
export function getBoxLidSupportError(props: Props): Error | null {
  const support = props.support
  if (!props.rest.every(Number.isFinite)) return new Error("Invalid box lid rest")
  if (support === null) {
    if (props.rest[1] !== 0) return new Error("Raised lid rest has no physical support")
    return null
  }
  if (
    ![support.x0, support.x1, support.z0, support.z1, support.bottom, support.top].every(Number.isFinite) ||
    support.x0 >= support.x1 ||
    support.z0 >= support.z1 ||
    support.bottom < 0 ||
    support.bottom >= support.top
  )
    return new Error("Invalid box lid rest support")
  const halfWidth = (props.box.x1 - props.box.x0) / 2,
    halfDepth = (props.box.z1 - props.box.z0) / 2
  if (
    Math.abs(props.rest[1] - support.top) > 1e-9 ||
    props.rest[0] - halfWidth < support.x0 - 1e-9 ||
    props.rest[0] + halfWidth > support.x1 + 1e-9 ||
    props.rest[2] - halfDepth < support.z0 - 1e-9 ||
    props.rest[2] + halfDepth > support.z1 + 1e-9
  )
    return new Error("Box lid is not wholly supported by its rest")

  return null
}
