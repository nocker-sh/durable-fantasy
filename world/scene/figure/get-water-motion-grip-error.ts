import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { PALM_GRIP_OFFSET } from "#/world/scene/figure/arm-grip"
import type { getArmGripMotionBound } from "#/world/scene/figure/get-arm-grip-motion-bound"
import type { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
type Bound = Exclude<ReturnType<typeof getArmGripMotionBound>, Error>
type Props = { posed: Exclude<ReturnType<typeof getHeldWaterVesselPose>, Error>; motion: Readonly<Record<"l" | "r", Bound>> }

/** The solved grip follows the bar centre exactly; bound the rotating wrist plane throughout the interval. */
export function getWaterMotionGripError(props: Props): Error | null {
  for (const bar of props.posed.parts) {
    if (bar.kind !== "capsule" || bar.section !== "grip") continue
    const motion = props.motion[bar.side],
      joints = props.posed.skeleton.p,
      elbow = joints[`lowerarm_${bar.side}`],
      wrist = joints[`hand_${bar.side}`]
    if (!Object.values(motion).every((value) => Number.isFinite(value) && value >= 0) || motion.scale <= 0) return new Error("Invalid moving water grip bound")
    const shape = nativeArmSurfaces({ scale: motion.scale, shoulder: joints[`upperarm_${bar.side}`], elbow: elbow, wrist: wrist }),
      direction = norm(sub(wrist, elbow))
    const core = shape.palm.radius - Math.abs(PALM_GRIP_OFFSET - shape.palm.fromWrist)
    if (Math.SQRT2 * bar.radius + 1e-10 >= core) return new Error("Moving water grip leaves no native palm around its opening")
    const relativeSpeed = motion.grip + motion.wrist,
      radius = Math.max(...[bar.from, bar.to].map((point) => Math.hypot(...sub([...point], wrist)))) + relativeSpeed / 2
    const margin = (relativeSpeed + radius * motion.direction) / 2 + 1e-10
    if (Math.min(...[bar.from, bar.to].map((point) => dot(sub([...point], wrist), direction))) - bar.radius <= margin) return new Error("Moving water handle cuff clearance remains unresolved")
  }

  return null
}
