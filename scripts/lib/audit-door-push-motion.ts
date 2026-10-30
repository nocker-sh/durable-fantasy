import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import { MAX_HAND_REACH_M, MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { DoorPush } from "#/scripts/lib/door-push"
import { pointSegmentDistance } from "#/scripts/lib/door-push/point-segment-distance"

/** Certify each continuous linear pose interval with a distance bound, not just its displayed poses. */
export function auditDoorPushMotion(swing: DoorSwing, push: DoorPush): string[] {
  const errors = new Set<string>(),
    poses = push.poses,
    grip = doorHandleAlong(swing.radius, swing.handle_along_m)
  if (!Number.isFinite(push.body_radius_m) || push.body_radius_m * 2 < MIN_PASSAGE_WIDTH_M) return ["push body is smaller than the design width"]
  if (
    poses.length < 2 ||
    poses[0].angle_deg !== 0 ||
    poses.at(-1)!.angle_deg !== 90 ||
    poses.some((pose, i) => !Number.isFinite(pose.angle_deg) || pose.body_m.some((value) => !Number.isFinite(value)) || (i > 0 && pose.angle_deg <= poses[i - 1].angle_deg))
  )
    return ["push poses do not continuously open a closed door"]
  if (poses[0].body_m[1] + push.body_radius_m > 1e-9 || poses.at(-1)!.body_m[1] - push.body_radius_m < -1e-9) errors.add("push does not move the body from outside to inside")
  for (const i = { value: 1 }; i.value < poses.length; i.value++) {
    const a = poses[i.value - 1],
      b = poses[i.value],
      angularChange = ((b.angle_deg - a.angle_deg) * Math.PI) / 180
    const speedBound = Math.hypot(b.body_m[0] - a.body_m[0], b.body_m[1] - a.body_m[1]) + angularChange * swing.radius
    const inspect = (start: number, end: number, depth: number): void => {
      const t = (start + end) / 2,
        angle = ((a.angle_deg + (b.angle_deg - a.angle_deg) * t) * Math.PI) / 180
      const body = a.body_m.map((value, k) => value + (b.body_m[k] - value) * t),
        tip = [swing.radius * Math.cos(angle), swing.radius * Math.sin(angle)],
        handle = [grip * Math.cos(angle), grip * Math.sin(angle)]
      const clearance = pointSegmentDistance(body, tip) - push.body_radius_m - (swing.thickness_m ?? 0) / 2
      const reach = Math.hypot(body[0] - handle[0], body[1] - handle[1]),
        uncertainty = (speedBound * (end - start)) / 2
      if (clearance < -1e-9) {
        errors.add("push body intersects the moving panel")
        return
      }
      if (reach > MAX_HAND_REACH_M + 1e-9) {
        errors.add("push handle is out of reach")
        return
      }
      if (clearance - uncertainty >= 0 && reach + uncertainty <= MAX_HAND_REACH_M) return
      if (depth === 20) {
        errors.add("push interval could not be certified")
        return
      }
      inspect(start, t, depth + 1)
      inspect(t, end, depth + 1)
    }
    inspect(0, 1, 0)
  }
  return [...errors]
}
