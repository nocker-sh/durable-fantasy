import type { Rect } from "#/world/town/floorplan/types"
import type { Furniture } from "#/world/town/interiors"

type Props = Readonly<{ rect: Rect; x0: number; z0: number; scale: number }>

/** Project an authored rectangle to the renderer's centre and dimensions without changing calculation order. */
export function projectInteriorPiecePlacement(props: Props): Pick<Furniture, "x" | "z" | "w" | "d"> {
  const rect = props.rect,
    scale = props.scale
  return { x: props.x0 + ((rect.x0 + rect.x1) / 2) * scale, z: props.z0 + ((rect.z0 + rect.z1) / 2) * scale, w: (rect.x1 - rect.x0) * scale, d: (rect.z1 - rect.z0) * scale }
}
