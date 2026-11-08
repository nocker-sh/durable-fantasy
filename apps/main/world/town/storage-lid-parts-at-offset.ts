import type { StorageLidPlan } from "#/world/town/storage-lid"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { plan: StorageLidPlan; offset: Point3 }

/** Only the existing cover moves; boards and handles retain their identities and the grounded body stays fixed. */
export function storageLidPartsAtOffset(props: Props): StorageBoxPart[] {
  if (!props.offset.every(Number.isFinite)) throw new Error("Invalid storage lid offset")

  return [
    ...props.plan.body,
    ...props.plan.cover.map((part) => ({
      ...part,
      x0: part.x0 + props.offset[0],
      x1: part.x1 + props.offset[0],
      y0: part.y0 + props.offset[1],
      y1: part.y1 + props.offset[1],
      z0: part.z0 + props.offset[2],
      z1: part.z1 + props.offset[2],
    })),
  ]
}
