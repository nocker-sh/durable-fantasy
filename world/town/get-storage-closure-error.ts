import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
type Props = { original: ReadonlyArray<StorageBoxPart>; closed: ReadonlyArray<StorageBoxPart>; lowering: Point3 }
/** Closing must restore every physical piece at the lowered position, without adding a teleport between phases. */
export function getStorageClosureError(props: Props): Error | null {
  if (!props.original.length || props.closed.length !== props.original.length) return new Error("Storage lid movement does not join its closed box")

  for (const index of props.closed.keys()) {
    const closed = props.closed[index],
      original = props.original[index]
    if (
      closed.part !== original.part ||
      [
        closed.x0 - original.x0 - props.lowering[0],
        closed.x1 - original.x1 - props.lowering[0],
        closed.y0 - original.y0 - props.lowering[1],
        closed.y1 - original.y1 - props.lowering[1],
        closed.z0 - original.z0 - props.lowering[2],
        closed.z1 - original.z1 - props.lowering[2],
      ].some((difference) => !Number.isFinite(difference) || Math.abs(difference) > 1e-9)
    )
      return new Error("Storage lid movement does not join its closed box")
  }
  return null
}
