import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = {
  origin: readonly [number, number]
  width: number
  depth: number
  height: number
  thickness: number
  backThickness: number
  backHeight: number
  armWidth: number
  armThickness: number
  armInset: number
  frontSetback: number
}
export type WaterSupportPart = { part: "top" | "back" | "arm"; min: Point3; max: Point3 }

/** A west-wall shelf leaves toes free; two embedded arms and a backboard support the continuous top. */
export function getWaterVesselSupportParts(props: Props): readonly WaterSupportPart[] | Error {
  if (
    ![...props.origin, props.width, props.depth, props.height, props.thickness, props.backThickness, props.backHeight, props.armWidth, props.armThickness, props.armInset, props.frontSetback].every(
      Number.isFinite,
    ) ||
    [props.width, props.depth, props.height, props.thickness, props.backThickness, props.backHeight, props.armWidth, props.armThickness, props.armInset, props.frontSetback].some((value) => value <= 0)
  )
    return new Error("Invalid water support dimensions")
  const underside = props.height - props.thickness,
    x = props.origin[0],
    z = props.origin[1]
  if (underside - props.backHeight <= 0 || props.armThickness > props.backHeight || 2 * props.armInset + props.armWidth >= props.depth || props.backThickness + props.frontSetback >= props.width)
    return new Error("Water shelf has no usable top or attached supports")
  const parts: WaterSupportPart[] = [
    { part: "top", min: [x, underside, z], max: [x + props.width, props.height, z + props.depth] },
    { part: "back", min: [x, underside - props.backHeight, z], max: [x + props.backThickness, underside, z + props.depth] },
  ]
  for (const side of [props.armInset, props.depth - props.armInset - props.armWidth])
    parts.push({ part: "arm", min: [x + props.backThickness / 2, underside - props.armThickness, z + side], max: [x + props.width - props.frontSetback, underside, z + side + props.armWidth] })

  return parts
}
