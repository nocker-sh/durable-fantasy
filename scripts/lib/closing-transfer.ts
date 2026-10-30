import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import { segmentSegmentDistance } from "#/lib/engine/segment-segment-distance"
import { MAX_HAND_REACH_M } from "#/scripts/lib/spatial-rules"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import type { PushPose, DoorPush } from "#/scripts/lib/door-push"

/** Keep the fully open panel held while moving to the indoor closing position. */
export function closingTransfer(swing: DoorSwing, push: DoorPush, operation: DoorOperation): { transfer: DoorPush; errors: string[] } {
  const angle = (operation.end_deg * Math.PI) / 180
  const start = push.poses.at(-1)!,
    end: PushPose = { angle_deg: 90, body_m: [operation.orbit_radius_m * Math.cos(angle), operation.orbit_radius_m * Math.sin(angle)] }
  const transfer: DoorPush = { body_radius_m: push.body_radius_m, poses: [start, end] },
    errors: string[] = []
  if (Math.abs(push.body_radius_m - operation.body_radius_m) > 1e-9) errors.push("push changes body size before indoor closing")
  if (segmentSegmentDistance({ from: start.body_m, to: end.body_m, otherFrom: [0, 0], otherTo: [0, swing.radius] }) < push.body_radius_m + (swing.thickness_m ?? 0) / 2 - 1e-9)
    errors.push("closing transfer body intersects the held panel")
  if ([start, end].some((pose) => Math.hypot(pose.body_m[0], pose.body_m[1] - doorHandleAlong(swing.radius, swing.handle_along_m)) > MAX_HAND_REACH_M + 1e-9))
    errors.push("closing transfer releases an unreachable handle")
  return { transfer, errors }
}
