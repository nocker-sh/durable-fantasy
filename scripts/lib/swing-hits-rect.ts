import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { rectInDoorFrame } from "#/scripts/lib/rect-in-door-frame"
import { solidLeafHitsBox } from "#/scripts/lib/solid-door"
import type { DoorSwing } from "#/scripts/lib/door-swing"

/** A quarter-circle tests every angle, not just the fully open and closed leaf. */
export function swingHitsRect(swing: DoorSwing, rect: number[]): boolean {
  if (swing.thickness_m) return solidLeafHitsBox(swing.radius, swing.thickness_m, rectInDoorFrame(swing, rect))
  const xState = rect,
    x = xState[0],
    y = xState[1],
    w = xState[2],
    h = xState[3],
    sx0State = swing.bounds,
    sx0 = sx0State[0],
    sy0 = sx0State[1],
    sx1 = sx0State[2],
    sy1 = sx0State[3]
  const overlap: [number, number, number, number] = [Math.max(x, sx0), Math.max(y, sy0), Math.min(x + w, sx1), Math.min(y + h, sy1)]
  return overlap[2] - overlap[0] > 1e-9 && overlap[3] - overlap[1] > 1e-9 && segmentRectDistance(overlap, swing.hinge, swing.hinge) < swing.radius - 1e-9
}
