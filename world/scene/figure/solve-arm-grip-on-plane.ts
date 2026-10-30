import { solveTwoBoneOnPlane } from "#/lib/engine/solve-two-bone-on-plane"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { addVector3 as add } from "../../../lib/engine/add-vector3"
import { scaleVector3 as mul } from "../../../lib/engine/scale-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = { skeleton: Skel; hand: "l" | "r"; target: Point3; pole: Point3; normal: Point3 }

/** Place the elbow in the palm's bar-normal plane without changing shoulder, wrist offset or native link lengths. */
export function solveArmGripOnPlane(props: Props) {
  const lengths = armGripLengths(props.skeleton, props.hand)
  const solved = solveTwoBoneOnPlane({
    root: props.skeleton.p[`upperarm_${props.hand}`],
    target: props.target,
    upper: lengths.upper,
    lower: lengths.forearm + lengths.palm,
    pole: props.pole,
    normal: props.normal,
  })
  if (solved instanceof Error) return solved
  const elbow: [number, number, number] = [...solved.joint],
    wrist = add(elbow, mul(sub([...props.target], elbow), lengths.forearm / (lengths.forearm + lengths.palm)))
  const solution = { elbow, wrist, grip: armGripPoint(elbow, wrist) },
    skeleton: Skel = { ...props.skeleton, p: { ...props.skeleton.p, [`lowerarm_${props.hand}`]: elbow, [`hand_${props.hand}`]: wrist } }

  return { skeleton, solution }
}
