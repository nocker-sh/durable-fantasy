import type { Rect } from "#/world/town/floorplan/types"

type Props = Readonly<{ rect: Rect; x0: number; z0: number; scale: number }>

/** Translate an authored rectangle after applying the indoor presentation scale once. */
export function projectInteriorRectangle(props: Props): Rect {
  return { x0: props.x0 + props.rect.x0 * props.scale, z0: props.z0 + props.rect.z0 * props.scale, x1: props.x0 + props.rect.x1 * props.scale, z1: props.z0 + props.rect.z1 * props.scale }
}
