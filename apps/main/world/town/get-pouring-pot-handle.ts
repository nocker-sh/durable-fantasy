import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = {
  diameter: number
  baseDiameter: number
  height: number
  wall: number
  lidRadius: number
  bailHeight: number
  bailForward: number
  bailSpan: number
  bailRadius: number
  gripLength: number
  gripRadius: number
}
export type PotHandleSection = Readonly<{ part: "root" | "upright" | "bridge" | "grip"; from: Point3; to: Point3; radius: number }> &
  (Readonly<{ material: "iron" }> | Readonly<{ material: "wood"; innerRadius: number }>)

/** Fixed uprights leave the lid free; the wooden sleeve covers the same straight iron carrying bar. */
export function getPouringPotHandle(props: Props): readonly PotHandleSection[] | Error {
  if (
    !Object.entries(props).every((entry) => Number.isFinite(entry[1]) && (entry[1] > 0 || (entry[0] === "bailForward" && entry[1] === 0))) ||
    props.bailRadius >= props.height * 0.75 ||
    props.bailForward > props.diameter / 2 ||
    props.bailHeight <= props.height ||
    props.bailSpan / 2 - props.bailRadius <= props.lidRadius ||
    props.gripLength >= props.bailSpan ||
    props.gripRadius <= props.bailRadius ||
    props.bailHeight - 2 * props.gripRadius <= props.height ||
    props.gripLength / 2 + props.gripRadius > props.bailSpan / 2 + props.bailRadius ||
    ((props.diameter - props.baseDiameter) * props.bailRadius) / props.height >= props.wall
  )
    return new Error("Invalid pouring pot carrying handle")
  if (props.bailSpan / 2 <= props.diameter / 2 + props.bailRadius || props.gripRadius > props.diameter / 2) return new Error("Pot carrying handle leaves its measured envelope")
  const parts: PotHandleSection[] = [],
    shoulder = props.height * 0.75,
    rootRadius = props.baseDiameter / 2 + (props.diameter - props.baseDiameter) * 0.375 + props.bailRadius - props.wall / 2
  for (const sign of [-1, 1]) {
    const root: Point3 = [0, shoulder, sign * rootRadius],
      foot: Point3 = [props.bailForward, shoulder, (sign * props.bailSpan) / 2],
      upper: Point3 = [props.bailForward, props.bailHeight, (sign * props.bailSpan) / 2]
    parts.push({ part: "root", from: root, to: foot, radius: props.bailRadius, material: "iron" }, { part: "upright", from: foot, to: upper, radius: props.bailRadius, material: "iron" })
  }
  parts.push(
    { part: "bridge", from: [props.bailForward, props.bailHeight, -props.bailSpan / 2], to: [props.bailForward, props.bailHeight, props.bailSpan / 2], radius: props.bailRadius, material: "iron" },
    {
      part: "grip",
      from: [props.bailForward, props.bailHeight, -props.gripLength / 2],
      to: [props.bailForward, props.bailHeight, props.gripLength / 2],
      radius: props.gripRadius,
      material: "wood",
      innerRadius: props.bailRadius,
    },
  )

  return parts
}
