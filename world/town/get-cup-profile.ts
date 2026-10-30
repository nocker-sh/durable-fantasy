import { getBowlProfile } from "#/world/town/get-bowl-profile"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { diameter: number; height: number; baseDiameter: number; wall: number; bottom: number; handleGap: number; handleRadius: number; handleBottom: number; handleTop: number }

/** A hollow tapered cup and one ear handle share a single measured envelope; roots embed in the wall, outside the cavity. */
export function getCupProfile(props: Props) {
  const bowl = getBowlProfile({ diameter: props.diameter, height: props.height, baseDiameter: props.baseDiameter, wall: props.wall, bottom: props.bottom })
  if (bowl instanceof Error) return bowl
  if (![props.handleGap, props.handleRadius, props.handleBottom, props.handleTop].every((value) => Number.isFinite(value) && value > 0)) return new Error("Invalid cup handle dimensions")
  const slope = (props.diameter - props.baseDiameter) / (2 * props.height),
    radius = props.handleRadius,
    centre: readonly [number, number] = [props.diameter / 2, props.diameter / 2]
  if (props.handleBottom - radius <= props.bottom || props.handleTop + radius >= props.height || props.handleTop - props.handleBottom <= 2 * radius || 2 * slope * radius >= props.wall)
    return new Error("Cup handle leaves no open loop or solid attachment")
  const outer = props.diameter + props.handleGap + radius,
    root = (height: number) => centre[0] + props.baseDiameter / 2 + slope * height + radius - props.wall / 2
  const from = [root(props.handleBottom), props.handleBottom, centre[1]] satisfies Point3,
    to = [root(props.handleTop), props.handleTop, centre[1]] satisfies Point3
  const low: Point3 = [outer, props.handleBottom, centre[1]],
    high: Point3 = [outer, props.handleTop, centre[1]]
  const handle = [
    { from, to: low, radius },
    { from: low, to: high, radius },
    { from: high, to, radius },
  ]
  const width = outer + radius
  if (!Number.isFinite(width) || root(props.handleBottom) >= outer || root(props.handleTop) >= outer) return new Error("Cup handle does not clear its body")

  return { bowl, centre, width, depth: props.diameter, height: props.height, handle }
}
