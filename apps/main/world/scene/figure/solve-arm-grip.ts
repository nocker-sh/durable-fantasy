import { solveTwoBone } from "#/lib/engine/solve-two-bone"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { Skel } from "#/world/scene/rig"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"

type Props = {
  skeleton: Skel
  side: "l" | "r"
  target: V3
  pole: V3
}

/** Joint positions only; callers still need to resolve wrist rotation, skin pose and collisions. */
export function solveArmGrip(props: Props) {
  const lengths = armGripLengths(props.skeleton, props.side),
    upper = lengths.upper,
    forearm = lengths.forearm,
    palm = lengths.palm,
    solution = solveTwoBone({ root: props.skeleton.p[`upperarm_${props.side}`], target: props.target, upper: upper, lower: forearm + palm, pole: props.pole })
  if (!solution) return undefined
  const elbow: [number, number, number] = [...solution.joint],
    wrist = add(elbow, mul(sub(props.target, elbow), forearm / (forearm + palm)))
  return { elbow, wrist, grip: armGripPoint(elbow, wrist) }
}
