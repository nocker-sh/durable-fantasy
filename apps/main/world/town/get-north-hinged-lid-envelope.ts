import type { StorageBoxBounds } from "#/world/town/storage-box-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Readonly<{ box: StorageBoxBounds; lid: number }>

/** Enclose every corner over a north-edge rotation from closed to vertical; the highest corner occurs before the final angle. */
export function getNorthHingedLidEnvelope(props: Props): Cuboid | Error {
  const box = props.box,
    depth = box.z1 - box.z0,
    height = box.y1 - box.y0
  if (![box.x0, box.x1, box.y0, box.y1, box.z0, box.z1, props.lid].every(Number.isFinite) || box.x0 >= box.x1 || depth <= 0 || props.lid <= 0 || props.lid >= height)
    return new Error("Invalid north-hinged lid geometry")
  const hinge = box.y1 - props.lid,
    top = hinge + Math.hypot(depth, props.lid)
  if (!Number.isFinite(top) || top <= hinge || box.z0 - props.lid >= box.z0) return new Error("Unbounded or lost north-hinged lid sweep")

  return { x0: box.x0, x1: box.x1, bottom: hinge, top, z0: box.z0 - props.lid, z1: box.z1 }
}
