import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { storageBoxParts } from "#/world/town/storage-box-parts"
import { getStorageBoxPackingError } from "#/world/town/get-storage-box-packing-error"
type Props = Readonly<{ size: readonly [number, number, number]; packageSize: readonly [number, number, number]; wall: number; lid: number; clearance: number }>

/** A closed rigid case surrounds the proposed folded envelope without compressing it or using the lid as contents space. */
export function getCoveredTextileBox(props: Props) {
  try {
    const dimensions = { width: props.size[0], height: props.size[1], depth: props.size[2], wall: props.wall, lid: props.lid },
      inside = storageBoxInterior(dimensions)
    if (
      !Number.isFinite(props.clearance) ||
      props.clearance <= 0 ||
      props.packageSize[0] + 2 * props.clearance > inside.width * (1 + Number.EPSILON * 4) ||
      props.packageSize[2] + 2 * props.clearance > inside.depth * (1 + Number.EPSILON * 4) ||
      props.packageSize[1] + props.clearance > inside.height * (1 + Number.EPSILON * 4)
    )
      return new Error("Textile package lacks case clearance")
    const content = {
      id: "folded-textile",
      origin: [(inside.width - props.packageSize[0]) / 2, 0, (inside.depth - props.packageSize[2]) / 2] satisfies readonly [number, number, number],
      size: props.packageSize,
    }
    const packing = getStorageBoxPackingError({ box: dimensions, contents: [content], clearance: props.clearance })
    if (packing) return packing
    const bounds = { x0: 0, y0: 0, z0: 0, x1: props.size[0], y1: props.size[1], z1: props.size[2] }
    return { inside, bounds, content, parts: storageBoxParts({ bounds: bounds, wall: props.wall, lid: props.lid }) }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid covered textile box")
  }
}
