import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { StorageBoxDimensions } from "#/world/town/storage-box-types"
type Props = { box: StorageBoxDimensions; contents: readonly LayoutBox[]; clearance: number }

/** Closed-box contents use the actual cavity and rest on its floor; unsupported stacking needs a different plan. */
export function getStorageBoxPackingError(props: Props): Error | null {
  try {
    const inside = storageBoxInterior(props.box)
    const error = getBoxLayoutError({ size: [inside.width, inside.height, inside.depth], boxes: props.contents, gap: props.clearance })
    if (error) return error
    if (props.contents.some((piece) => piece.origin[1] !== 0)) return new Error("Stored belongings need direct floor support")
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid storage box packing")
  }

  return null
}
