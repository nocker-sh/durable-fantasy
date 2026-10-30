import { storageBoxParts } from "#/world/town/storage-box-parts"
import type { StorageBoxHandle, StorageBoxBounds } from "#/world/town/storage-box-types"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { drawStorageBoxParts } from "#/world/scene/construction/draw-storage-box-parts"

/** The closed box and lifted lid use the same physical boards, including their inner faces. */
type Props = {
  builder: GB
  bounds: StorageBoxBounds
  wall: number
  lid: number
  lift?: number
  material?: "wood" | "iron"
  handle?: StorageBoxHandle
}

export function storageBox(props: Props) {
  const lift = props.lift === undefined ? 0 : props.lift
  const material = props.material === undefined ? "wood" : props.material

  drawStorageBoxParts(props.builder, storageBoxParts({ bounds: props.bounds, wall: props.wall, lid: props.lid, lift: lift, handle: props.handle }), material)
}
