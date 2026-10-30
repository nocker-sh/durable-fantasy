import { getBowlProfile } from "#/world/town/get-bowl-profile"
import { getPouringPotHandle } from "#/world/town/get-pouring-pot-handle"
type Props = {
  diameter: number
  height: number
  baseDiameter: number
  wall: number
  bottom: number
  fillLine: number
  lipStart: number
  lipLength: number
  lipHalfAngle: number
  bailHeight: number
  bailForward: number
  bailSpan: number
  bailRadius: number
  gripLength: number
  gripRadius: number
  lidRadius: number
  lidThickness: number
  knobHeight: number
  knobRadius: number
}

/** Usable capacity stops below the shaped pouring lip; the loose lid leaves that lip open. */
export function getPouringPotProfile(props: Props) {
  if (!Object.entries(props).every((entry) => Number.isFinite(entry[1]) && (entry[1] > 0 || (entry[0] === "bailForward" && entry[1] === 0)))) return new Error("Invalid pouring pot dimensions")
  const body = getBowlProfile({ diameter: props.diameter, height: props.height, baseDiameter: props.baseDiameter, wall: props.wall, bottom: props.bottom }),
    slope = (props.diameter - props.baseDiameter) / (2 * props.height)
  if (body instanceof Error) return body
  if (
    props.bailForward > props.diameter / 2 ||
    props.fillLine <= props.bottom ||
    props.fillLine > props.lipStart ||
    props.lipStart >= props.height ||
    props.lipHalfAngle >= Math.PI / 2 ||
    props.lidRadius <= props.diameter / 2 - props.wall ||
    props.lidRadius >= props.diameter / 2 ||
    props.knobRadius >= props.lidRadius
  )
    return new Error("Pouring pot has no open lip, lid seat or usable fill line")
  const radiusAt = (height: number) => props.baseDiameter / 2 + slope * height,
    depth = props.fillLine - props.bottom,
    low = radiusAt(props.bottom) - props.wall,
    high = radiusAt(props.fillLine) - props.wall
  const capacity = (Math.PI * depth * (low * low + low * high + high * high)) / 3,
    handle = getPouringPotHandle(props)
  if (handle instanceof Error) return handle
  if (props.height + props.lidThickness + props.knobHeight >= props.bailHeight - props.gripRadius) return new Error("Pot lid cannot fit below its carrying grip")
  const outer = [
    [0, 0],
    [props.baseDiameter / 2, 0],
    [radiusAt(props.lipStart), props.lipStart],
    [props.diameter / 2, props.height],
  ] satisfies [number, number][]
  const inner = [
    [props.diameter / 2 - props.wall, props.height],
    [radiusAt(props.lipStart) - props.wall, props.lipStart],
    [low, props.bottom],
    [0, props.bottom],
  ] satisfies [number, number][]
  const min = [-props.diameter / 2, 0, -props.bailSpan / 2 - props.bailRadius] satisfies [number, number, number],
    max = [Math.max(props.diameter / 2 + props.lipLength, props.bailForward + props.gripRadius), props.bailHeight + props.gripRadius, props.bailSpan / 2 + props.bailRadius] satisfies [
      number,
      number,
      number,
    ]
  if (!Number.isFinite(capacity) || capacity <= 0 || ![...min, ...max].every(Number.isFinite)) return new Error("Unbounded pouring pot profile")

  return { dimensions: { ...props }, body, capacity, outer, inner, handle, min, max, width: max[0] - min[0], height: max[1], depth: max[2] - min[2] }
}
