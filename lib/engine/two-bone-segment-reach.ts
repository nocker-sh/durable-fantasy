import { addVector3 } from "./add-vector3"
import { subtractVector3 } from "./subtract-vector3"
import { scaleVector3 } from "./scale-vector3"
import { dotVector3 } from "./dot-vector3"
import type { TwoBoneSegment as Props } from "./two-bone-types"
/** Reachability of every point on a straight segment, including the chain's inner unreachable ball. */
export function twoBoneSegmentReach(props: Props): boolean {
  if (![...props.root, ...props.from, ...props.to, props.upper, props.lower].every(Number.isFinite) || props.upper <= 0 || props.lower <= 0) throw new Error("Invalid two-bone dimensions")
  const delta = subtractVector3(props.to, props.from),
    length2 = dotVector3(delta, delta),
    t = length2 ? Math.max(0, Math.min(1, dotVector3(subtractVector3(props.root, props.from), delta) / length2)) : 0
  const closest = addVector3(props.from, scaleVector3(delta, t)),
    minimum = Math.hypot(...subtractVector3(closest, props.root)),
    maximum = Math.max(Math.hypot(...subtractVector3(props.from, props.root)), Math.hypot(...subtractVector3(props.to, props.root)))
  return minimum >= Math.abs(props.upper - props.lower) && maximum <= props.upper + props.lower
}
