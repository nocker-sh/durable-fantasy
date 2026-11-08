import type { Rect } from "#/world/town/floorplan/types"

type Props = Readonly<{ cellM: number; x: number; z: number; width: number; depth: number }>

/** Convert grid bounds together, retaining the same arithmetic for room, furniture and partition edges. */
export function getAuthoredGridExtent(props: Props): Rect {
  return { x0: props.x * props.cellM, z0: props.z * props.cellM, x1: (props.x + props.width) * props.cellM, z1: (props.z + props.depth) * props.cellM }
}
