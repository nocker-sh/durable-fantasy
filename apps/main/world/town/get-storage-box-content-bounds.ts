import type { StorageBoxBounds } from "#/world/town/storage-box-types"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = { box: StorageBoxBounds; wall: number; contents: readonly LayoutBox[] }

/** Validated cavity coordinates start above the actual bottom and inside its walls, not at the outer floor corner. */
export function getStorageBoxContentBounds(props: Props): readonly Cuboid[] {
  return props.contents.map((piece) => ({
    x0: props.box.x0 + props.wall + piece.origin[0],
    x1: props.box.x0 + props.wall + piece.origin[0] + piece.size[0],
    bottom: props.box.y0 + props.wall + piece.origin[1],
    top: props.box.y0 + props.wall + piece.origin[1] + piece.size[1],
    z0: props.box.z0 + props.wall + piece.origin[2],
    z1: props.box.z0 + props.wall + piece.origin[2] + piece.size[2],
  }))
}
