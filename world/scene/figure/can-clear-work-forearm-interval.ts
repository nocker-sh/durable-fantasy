import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { twoBoneJointSpeedBound } from "#/lib/engine/two-bone-joint-speed-bound"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { nativeArmMotionSpeed } from "#/world/scene/figure/native-arm-motion-speed"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
type Props = { look: Look; skeleton: Skel; hand: "l" | "r"; pole: V3; fixed: readonly Primitive[]; from: V3; to: V3 }

/** The midpoint's inflated native surfaces cover every arm pose in this fixed-support interval. */
export function canClearWorkForearmInterval(props: Props): boolean {
  const metrics = armGripLengths(props.skeleton, props.hand),
    shoulder = props.skeleton.p[`upperarm_${props.hand}`]
  const speed = twoBoneJointSpeedBound({ root: shoulder, from: props.from, to: props.to, upper: metrics.upper, lower: metrics.forearm + metrics.palm, pole: props.pole })
  if (speed === undefined) return false
  const target: V3 = [(props.from[0] + props.to[0]) / 2, (props.from[1] + props.to[1]) / 2, (props.from[2] + props.to[2]) / 2]
  const pose = solveArmGripPose({ skeleton: props.skeleton, hand: props.hand, target, pole: props.pole })
  if (pose instanceof Error) return false
  const scale = createBodyContext(props.look, props.skeleton, null).S
  const shape = nativeArmSurfaces({ scale: scale, shoulder: shoulder, elbow: pose.solution.elbow, wrist: pose.solution.wrist })
  const margin =
    nativeArmMotionSpeed({ scale: scale, forearm: metrics.forearm, palm: metrics.palm, elbowSpeed: speed, gripSpeed: Math.hypot(...props.to.map((value, axis) => value - props.from[axis])) }) / 2 +
    1e-10

  return props.fixed.every((primitive) => [shape.forearm(), shape.uncutCuff].every((surface) => canSeparateSurfaceFromPrimitive({ surface, primitive, margin })))
}
