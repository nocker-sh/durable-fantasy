import { getTwoBonePoleSpeedBound } from "#/lib/engine/get-two-bone-pole-speed-bound"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { nativeArmMotionSpeed } from "#/world/scene/figure/native-arm-motion-speed"
import { createBodyContext } from "#/world/scene/figure/context"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Omit<Parameters<typeof getSeatedArmClearanceError>[0], "margin" | "movingHand"> & { hand: "l" | "r"; target: Point3; from: Point3; to: Point3 }

/** Hold the palm anchor fixed while a continuous pole line changes the elbow's bend plane. */
export function canClearSeatedArmPoleInterval(props: Props): boolean {
  const lengths = armGripLengths(props.skeleton, props.hand)
  const speed = getTwoBonePoleSpeedBound({
    root: props.skeleton.p[`upperarm_${props.hand}`],
    target: props.target,
    upper: lengths.upper,
    lower: lengths.forearm + lengths.palm,
    from: props.from,
    to: props.to,
  })
  if (typeof speed !== "number") return false
  const pole = [(props.from[0] + props.to[0]) / 2, (props.from[1] + props.to[1]) / 2, (props.from[2] + props.to[2]) / 2] satisfies [number, number, number]
  const posed = solveArmGripPose({ skeleton: props.skeleton, hand: props.hand, target: props.target, pole })
  if (posed instanceof Error) return false
  const scale = createBodyContext(props.look, props.skeleton, null).S
  const margin = nativeArmMotionSpeed({ scale: scale, forearm: lengths.forearm, palm: lengths.palm, elbowSpeed: speed, gripSpeed: 0 }) / 2 + 1e-10

  return getSeatedArmClearanceError({ ...props, skeleton: posed.skeleton, margin, movingHand: props.hand }) === null
}
