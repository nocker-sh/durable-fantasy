import { addVector3 } from "./add-vector3"
import { subtractVector3 } from "./subtract-vector3"
import { scaleVector3 } from "./scale-vector3"
import { getTwoBoneBend } from "./get-two-bone-bend"
import type { TwoBoneTarget as Props, TwoBoneSolution } from "./two-bone-types"
/** Intersection of the two fixed-length joint spheres; unreachable targets never stretch the links. */
export function solveTwoBone(props: Props): TwoBoneSolution | undefined {
  if (![...props.root, ...props.target, ...props.pole, props.upper, props.lower].every(Number.isFinite) || props.upper <= 0 || props.lower <= 0) throw new Error("Invalid two-bone dimensions")
  const delta = subtractVector3(props.target, props.root),
    d = Math.hypot(...delta)
  if (d > props.upper + props.lower || d < Math.abs(props.upper - props.lower)) return undefined
  if (d === 0) {
    const p = subtractVector3(props.pole, props.root),
      n = Math.hypot(...p)
    return { joint: addVector3(props.root, scaleVector3(n ? p : [1, 0, 0], props.upper / (n || 1))), end: props.target }
  }
  const axis = scaleVector3(delta, 1 / d),
    along = (props.upper * props.upper - props.lower * props.lower + d * d) / (2 * d),
    height = Math.sqrt(Math.max(0, props.upper * props.upper - along * along))
  const bend = getTwoBoneBend({ root: props.root, pole: props.pole, axis })
  return { joint: addVector3(addVector3(props.root, scaleVector3(axis, along)), scaleVector3(bend.direction, height / bend.magnitude)), end: props.target }
}
