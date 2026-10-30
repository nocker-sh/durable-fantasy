import type { DoorSwing } from "#/scripts/lib/door-swing"
import { rectInDoorFrame } from "#/scripts/lib/rect-in-door-frame"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
import type { DoorOperation } from "#/scripts/lib/door-operation"

/** Transform the operator's circular path into the leaf's closed/inward coordinate frame. */
export function operatorRectDistance(swing: DoorSwing, operation: DoorOperation, rect: number[]): number {
  const box = rectInDoorFrame(swing, rect),
    points = [
      [box[0], box[1]],
      [box[0], box[3]],
      [box[2], box[1]],
      [box[2], box[3]],
    ]
  const start = (operation.start_deg * Math.PI) / 180,
    end = (operation.end_deg * Math.PI) / 180,
    radius = operation.orbit_radius_m
  const angles = [
    start,
    end,
    0,
    Math.PI / 2,
    ...points.map((entry) => {
      const u = entry[0]
      const v = entry[1]
      return Math.atan2(v, u)
    }),
  ]
  for (const u of [box[0], box[2]]) if (Math.abs(u) <= radius) angles.push(Math.acos(u / radius))
  for (const v of [box[1], box[3]]) if (Math.abs(v) <= radius) angles.push(Math.asin(v / radius))
  return Math.min(...angles.filter((angle) => angle >= start - 1e-9 && angle <= end + 1e-9).map((angle) => pointRectDistance(radius * Math.cos(angle), radius * Math.sin(angle), box)))
}
