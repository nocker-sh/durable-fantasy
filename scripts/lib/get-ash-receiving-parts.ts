import { ashReceivingSchema } from "#/scripts/lib/ash-receiving-schema"
import { storageBoxParts } from "#/world/town/storage-box-parts"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import { shelfLidHandle } from "#/world/town/shelf-lid-handle"
import type { ShelfItem, ShelfSpec } from "#/world/town/shelf"
type Props = { box: ShelfItem; front: ShelfSpec["front"]; receiving: unknown }
/** An open receiving box keeps the stored box's dimensions and orientation; placement does not certify ash transfer. */
export function getAshReceivingParts(props: Props): ReadonlyArray<StorageBoxPart> | Error {
  const receiving = ashReceivingSchema.safeParse(props.receiving)
  if (!receiving.success) return new Error("Ash receiver needs an unverified lifted-transfer placement")
  if (props.box.kind !== "box" || props.box.boxMaterial !== "iron" || props.box.wall === undefined || props.box.lid === undefined || !props.box.lidHandle)
    return new Error("Ash receiving placement needs its stored iron box")

  const isSideways = props.front === "e" || props.front === "w"
  const width = isSideways ? props.box.depth : props.box.width,
    depth = isSideways ? props.box.width : props.box.depth
  const centre = receiving.data.position_m
  const bounds = { x0: centre[0] - width / 2, x1: centre[0] + width / 2, z0: centre[1] - depth / 2, z1: centre[1] + depth / 2, y0: 0, y1: props.box.height }
  try {
    return storageBoxParts({ bounds: bounds, wall: props.box.wall, lid: props.box.lid, lift: 0, handle: shelfLidHandle({ front: props.front }, props.box) }).filter(
      (part) => part.part !== "lid" && part.part !== "lid-handle",
    )
  } catch (error) {
    if (error instanceof Error) return error
    throw error
  }
}
