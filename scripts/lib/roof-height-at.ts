import { gableRoofHeight } from "#/lib/engine/gable-roof-height"
import type { Roof } from "#/scripts/lib/roof-section"

/** Heights describe the clear underside, not the outer surface of the roof covering. */
type Props = {
  roof: Roof
  width_m: number
  depth_m: number
  x_m: number
  y_m: number
}

export function roofHeightAt(props: Props): number {
  return gableRoofHeight(
    {
      bounds: { x0: 0, z0: 0, x1: props.width_m, z1: props.depth_m },
      eave: props.roof.eave_underside_m,
      ridge: props.roof.ridge_underside_m,
      ridgeAxis: props.roof.ridge_axis === "x" ? "x" : "z",
      overhang: props.roof.overhang_m,
    },
    props.x_m,
    props.y_m,
  )
}
