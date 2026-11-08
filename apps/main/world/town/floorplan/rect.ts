import type { Rect } from "#/world/town/floorplan/types"

type Props = {
  x: number
  z: number
  w: number
  d: number
}

export const rect = (props: Props): Rect => ({ x0: props.x - props.w / 2, z0: props.z - props.d / 2, x1: props.x + props.w / 2, z1: props.z + props.d / 2 })
