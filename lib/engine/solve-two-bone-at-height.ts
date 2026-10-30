import { getTwoBoneHeightJoint } from "./get-two-bone-height-joint"
import type { TwoBoneTarget, TwoBoneSolution } from "./two-bone-types"
type Props = TwoBoneTarget & Readonly<{ height: number }>
/** Fixed joint height reduces the two joint spheres to intersecting circles in the horizontal plane. */
export function solveTwoBoneAtHeight(props: Props): TwoBoneSolution | undefined {
  if (![...props.root, ...props.target, ...props.pole, props.upper, props.lower, props.height].every(Number.isFinite) || props.upper <= 0 || props.lower <= 0)
    throw new Error("Invalid two-bone dimensions")
  const r2 = props.upper ** 2 - (props.height - props.root[1]) ** 2,
    s2 = props.lower ** 2 - (props.height - props.target[1]) ** 2
  if (r2 < 0 || s2 < 0) return undefined
  const joint = getTwoBoneHeightJoint({ root: props.root, target: props.target, pole: props.pole, height: props.height, upperRadiusSquared: r2, lowerRadiusSquared: s2 })
  if (!joint) return undefined
  return { joint, end: props.target }
}
