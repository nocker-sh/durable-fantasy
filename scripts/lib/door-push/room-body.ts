import { doorAxes } from "#/scripts/lib/door-axes"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import type { PushPose } from "#/scripts/lib/door-push"

export function roomBody(swing: DoorSwing, pose: PushPose): number[] {
  const inwardSource = doorAxes(swing),
    inward = inwardSource.inward,
    closed = inwardSource.closed
  return swing.hinge.map((value, i) => value + closed[i] * pose.body_m[0] + inward[i] * pose.body_m[1])
}
