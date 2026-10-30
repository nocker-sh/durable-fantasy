import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { Skel } from "#/world/scene/rig"
import { PALM_GRIP_OFFSET } from "#/world/scene/figure/arm-grip"

export function armGripLengths(skeleton: Skel, side: "l" | "r") {
  const shoulder = skeleton.rest[`upperarm_${side}`],
    elbow = skeleton.rest[`lowerarm_${side}`],
    wrist = skeleton.rest[`hand_${side}`]
  return { upper: Math.hypot(...sub(elbow, shoulder)), forearm: Math.hypot(...sub(wrist, elbow)), palm: PALM_GRIP_OFFSET }
}
